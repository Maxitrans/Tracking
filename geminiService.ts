
{/* 
  * Fix: Replaced placeholder content with the full implementation for the Gemini service.
  * This service handles the communication with the Google Gemini API to generate
  * tracking information based on user-provided form data. It follows the coding guidelines,
  * including using a response schema for structured JSON output.
*/}
import { GoogleGenAI, Type } from '@google/genai';
import type { TrackingData } from '../types';

// Per guidelines, API key must come from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: 'Um ID de rastreamento alfanumérico único, como "BR-12345-JP".' },
        movements: {
            type: Type.ARRAY,
            description: 'Uma lista de eventos de movimento da remessa, em ordem cronológica.',
            items: {
                type: Type.OBJECT,
                properties: {
                    timestamp: { type: Type.STRING, description: 'O carimbo de data/hora do evento no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ).' },
                    description: { type: Type.STRING, description: 'Uma breve descrição do evento de movimento.' }
                },
                required: ['timestamp', 'description']
            }
        }
    },
    required: ['id', 'movements']
};

export const generateTrackingData = async (formData: Omit<TrackingData, 'id' | 'movements' | 'movements.timestamp'>): Promise<TrackingData> => {
  const prompt = `
    Aja como um sistema de logística internacional. Gere dados de rastreamento de remessa com base nas seguintes informações.
    Crie um ID de rastreamento único e um único evento de movimento inicial com a descrição "Tracking criado" e o timestamp correspondente à "Data de Início da Viagem".

    - Origem: ${formData.origem}
    - Destino: ${formData.destino}
    - Exportador: ${formData.exportador}
    - Importador: ${formData.importador}
    - Invoice: ${formData.invoice}
    - CRT: ${formData.crt}
    - MIC/DTA: ${formData.mic}
    - Aduana Local: ${formData.aduanaLocal}
    - Aduana de Destino: ${formData.aduanaDestino}
    - Data de Início da Viagem: ${formData.dataInicioViagem}
    - Data Estimada de Chegada: ${formData.dataEstimadaChegada}

    Responda APENAS com o objeto JSON, seguindo o esquema fornecido. Não inclua markdown ou qualquer texto adicional.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    // In case the model returns the JSON inside a code block
    const cleanedJsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    const parsedData = JSON.parse(cleanedJsonString);

    if (!parsedData.id || !Array.isArray(parsedData.movements)) {
        throw new Error("Resposta da IA em formato inválido.");
    }

    const fullTrackingData: TrackingData = {
      ...formData,
      id: parsedData.id,
      movements: parsedData.movements.map((m: any) => ({
        description: m.description,
        timestamp: new Date(m.timestamp),
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()), // Ensure movements are sorted chronologically
    };

    return fullTrackingData;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Falha ao gerar dados de rastreamento. A IA pode estar sobrecarregada. Tente novamente.");
  }
};

export const predictNextMovement = async (trackingData: TrackingData): Promise<string> => {
  const history = trackingData.movements.map(m => `- ${m.timestamp.toLocaleString('pt-BR')}: ${m.description}`).join('\n');

  const prompt = `
    Aja como um sistema de logística internacional. Com base nos seguintes detalhes e histórico de uma remessa, preveja o próximo movimento mais provável.
    Seja conciso e realista. Forneça apenas a descrição do próximo evento, sem carimbo de data/hora ou qualquer outro texto.

    - Origem: ${trackingData.origem}
    - Destino: ${trackingData.destino}
    - Último Movimento: ${trackingData.movements[trackingData.movements.length - 1]?.description || 'N/A'}
    - Histórico Completo:
    ${history}

    Qual é o próximo passo lógico para esta remessa? Responda APENAS com a descrição do próximo movimento.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini API for prediction:", error);
    throw new Error("Falha ao sugerir o próximo movimento.");
  }
};

export const extractDataFromPDF = async (pdfBase64: string): Promise<Partial<Omit<TrackingData, 'id' | 'movements'>>> => {
    const formFieldsSchema = {
        type: Type.OBJECT,
        properties: {
            origem: { type: Type.STRING },
            destino: { type: Type.STRING },
            exportador: { type: Type.STRING },
            importador: { type: Type.STRING },
            invoice: { type: Type.STRING },
            crt: { type: Type.STRING },
            mic: { type: Type.STRING },
            aduanaLocal: { type: Type.STRING },
            aduanaDestino: { type: Type.STRING },
            dataInicioViagem: { type: Type.STRING, description: "Formato YYYY-MM-DD" },
            dataEstimadaChegada: { type: Type.STRING, description: "Formato YYYY-MM-DD" },
        }
    };

    const pdfPart = {
        inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
        },
    };

    const textPart = {
        text: `Extraia as seguintes informações deste documento PDF e retorne-as em formato JSON, seguindo o esquema fornecido. Se uma informação não for encontrada, omita a chave do JSON.
        - Origem da viagem
        - Destino da viagem
        - Nome do Exportador
        - Nome do Importador
        - Número da Invoice
        - Número do CRT
        - Número do MIC/DTA
        - Nome da Aduana Local ou Porto de Origem
        - Nome da Aduana de Destino ou Porto de Destino
        - Data de Início da Viagem (formato YYYY-MM-DD)
        - Data Estimada de Chegada (formato YYYY-MM-DD)
        
        Responda APENAS com o objeto JSON. Não inclua markdown.`
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using a more powerful model for document analysis
            contents: { parts: [textPart, pdfPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: formFieldsSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        return parsedData;

    } catch (error) {
        console.error("Error calling Gemini API for PDF extraction:", error);
        throw new Error("Falha ao extrair dados do PDF. Verifique o arquivo ou tente novamente.");
    }
};
