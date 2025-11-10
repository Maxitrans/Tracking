
{/* 
  * Fix: Replaced placeholder content with the full implementation for the App component.
  * This component manages the application's state, user input, and interactions between
  * the UI components and the Gemini service.
*/}
import React, { useState, useEffect, useMemo, FormEvent, useRef } from 'react';
import InputField from './components/InputField';
import TrackingCard from './components/TrackingCard';
import SavedTrackingsList from './components/SavedTrackingsList';
import { generateTrackingData, predictNextMovement, extractDataFromPDF } from './services/geminiService';
import type { TrackingData } from './types';
import { SparklesIcon, UploadCloudIcon } from './components/IconComponents';

const LOCAL_STORAGE_KEY = 'gemini-tracking-app-data';

const initialFormData = {
  origem: 'São Paulo, Brasil',
  destino: 'Tóquio, Japão',
  exportador: 'Indústrias Acme Ltda.',
  importador: 'Karakuri Corp.',
  invoice: 'INV-2024-00123',
  crt: 'CRT-54321',
  mic: 'MIC-98765',
  aduanaLocal: 'Porto de Santos, Brasil',
  aduanaDestino: 'Porto de Tóquio, Japão',
  dataInicioViagem: new Date().toISOString().split('T')[0],
  dataEstimadaChegada: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
};

const maxitransLogoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMSEhUTExMWFhUXGBgYGBgYGBgYGBgYGBgYFxcYGBgYHSggGBolHRgXITEhJSkrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAEsBcwMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAFBgMEAAIHAQj/xABEEAACAQMCAwQGBwYDBgcAAAABAgADBBESIQUxQVEGEyJhcYEykaEUQlKxwdEVIzNicpLwFkOCosLS4URUY5Ozw+Lx/9oADAMBAAIRAxEAPwD2AiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIi...';

const App: React.FC = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [savedTrackings, setSavedTrackings] = useState<TrackingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [activeTrackingId, setActiveTrackingId] = useState<string | undefined>();
  const [newMovement, setNewMovement] = useState('');
  const [isPredicting, setIsPredicting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const parsedData: TrackingData[] = JSON.parse(savedData).map((t: any) => ({
          ...t,
          movements: t.movements.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setSavedTrackings(parsedData);
      }
    } catch (e) {
      console.error("Failed to load saved trackings:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedTrackings));
    } catch(e) {
      console.error("Failed to save trackings:", e);
    }
  }, [savedTrackings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTrackingData(null);
    setActiveTrackingId(undefined);
    try {
      const result = await generateTrackingData(formData);
      setTrackingData(result);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const isCurrentTrackingSaved = useMemo(() => {
    if (!trackingData) return false;
    return savedTrackings.some(t => t.id === trackingData.id);
  }, [trackingData, savedTrackings]);

  const handleSave = () => {
    if (trackingData && !isCurrentTrackingSaved) {
      const newSavedTrackings = [trackingData, ...savedTrackings];
      setSavedTrackings(newSavedTrackings);
      setActiveTrackingId(trackingData.id);
    }
  };

  const handleLoad = (id: string) => {
    const trackingToLoad = savedTrackings.find(t => t.id === id);
    if (trackingToLoad) {
      setTrackingData(trackingToLoad);
      setActiveTrackingId(id);
      setError(null);
      setNewMovement('');
    }
  };
  
  const handleDelete = (id: string) => {
    setSavedTrackings(prev => prev.filter(t => t.id !== id));
    if (activeTrackingId === id) {
      setTrackingData(null);
      setActiveTrackingId(undefined);
    }
  };
  
  const handlePrint = () => {
    window.print();
  }

  const handleCopy = () => {
    if (!trackingData) return;
    
    const { id, origem, destino, exportador, importador, invoice, crt, mic, dataInicioViagem, dataEstimadaChegada, aduanaLocal, aduanaDestino, movements } = trackingData;
    const latestStatus = movements[movements.length - 1]?.description || 'N/A';
    
    const textToCopy = `
*DADOS DE RASTREAMENTO*

*ID:* ${id}
*Status Atual:* ${latestStatus}

*Origem:* ${origem}
*Destino:* ${destino}
*Exportador:* ${exportador}
*Importador:* ${importador}
*Invoice:* ${invoice}
*CRT:* ${crt}
*MIC/DTA:* ${mic}
*Aduana Local:* ${aduanaLocal}
*Aduana de Destino:* ${aduanaDestino}
*Início da Viagem:* ${new Date(dataInicioViagem + 'T00:00:00').toLocaleDateString('pt-BR')}
*Chegada Estimada:* ${new Date(dataEstimadaChegada + 'T00:00:00').toLocaleDateString('pt-BR')}

*HISTÓRICO DE MOVIMENTOS*
${movements.map(m => `- ${m.timestamp.toLocaleString('pt-BR')}: ${m.description}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('Copiado!');
      setTimeout(() => setCopyStatus(''), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setCopyStatus('Falhou!');
      setTimeout(() => setCopyStatus(''), 2000);
    });
  };

  const handleAddMovement = () => {
    if (!trackingData || !newMovement.trim()) return;

    const newMovementObject = {
      description: newMovement.trim(),
      timestamp: new Date(),
    };

    const updatedMovements = [...trackingData.movements, newMovementObject]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const updatedTrackingData = {
        ...trackingData,
        movements: updatedMovements,
    };
    
    setTrackingData(updatedTrackingData);

    const updatedSavedTrackings = savedTrackings.map(t => 
        t.id === updatedTrackingData.id ? updatedTrackingData : t
    );
    setSavedTrackings(updatedSavedTrackings);

    setNewMovement('');
  };

  const handleAddMovementFromStage = (description: string) => {
    if (!trackingData || !description.trim()) return;

    const newMovementObject = {
      description: description.trim(),
      timestamp: new Date(),
    };

    const updatedMovements = [...trackingData.movements, newMovementObject]
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const updatedTrackingData = {
        ...trackingData,
        movements: updatedMovements,
    };
    
    setTrackingData(updatedTrackingData);

    const updatedSavedTrackings = savedTrackings.map(t => 
        t.id === updatedTrackingData.id ? updatedTrackingData : t
    );
    setSavedTrackings(updatedSavedTrackings);
  };

  const handlePredictMovement = async () => {
      if (!trackingData) return;
      setIsPredicting(true);
      setError(null);
      try {
          const suggestion = await predictNextMovement(trackingData);
          setNewMovement(suggestion);
      } catch (err: any) {
          setError(err.message || 'Falha ao obter sugestão.');
      } finally {
          setIsPredicting(false);
      }
  };

  const handleDeleteLastMovement = () => {
    if (!trackingData || trackingData.movements.length <= 1) return;

    const updatedMovements = trackingData.movements.slice(0, -1);
    
    const updatedTrackingData = {
        ...trackingData,
        movements: updatedMovements,
    };
    
    setTrackingData(updatedTrackingData);

    const updatedSavedTrackings = savedTrackings.map(t => 
        t.id === updatedTrackingData.id ? updatedTrackingData : t
    );
    setSavedTrackings(updatedSavedTrackings);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
          try {
              const base64String = (reader.result as string).split(',')[1];
              const extractedData = await extractDataFromPDF(base64String);
              setFormData(prev => ({ ...prev, ...extractedData }));
          } catch (err: any) {
              setError(err.message || 'Erro ao processar o PDF.');
          } finally {
              setIsUploading(false);
              if (fileInputRef.current) {
                  fileInputRef.current.value = '';
              }
          }
      };
      reader.onerror = () => {
          setError('Falha ao ler o arquivo.');
          setIsUploading(false);
      };
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-center mb-4">
                    <img src={maxitransLogoBase64} alt="Maxitrans Logo" className="h-12" />
                </div>
                <h2 className="text-2xl font-bold mb-1 text-center">Gerador de Tracking</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">Insira os dados para gerar um novo rastreamento com IA.</p>
                
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden" 
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 text-gray-500 dark:text-gray-400 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isUploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Processando PDF...
                        </>
                    ) : (
                        <>
                            <UploadCloudIcon className="w-5 h-5 mr-2" />
                            Preencher com PDF
                        </>
                    )}
                </button>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField id="origem" label="Origem" value={formData.origem} onChange={handleInputChange} />
                    <InputField id="destino" label="Destino" value={formData.destino} onChange={handleInputChange} />
                    <InputField id="exportador" label="Exportador" value={formData.exportador} onChange={handleInputChange} />
                    <InputField id="importador" label="Importador" value={formData.importador} onChange={handleInputChange} />
                    <InputField id="invoice" label="Invoice" value={formData.invoice} onChange={handleInputChange} />
                    <InputField id="crt" label="CRT" value={formData.crt} onChange={handleInputChange} />
                    <InputField id="mic" label="MIC/DTA" value={formData.mic} onChange={handleInputChange} />
                    <InputField id="aduanaLocal" label="Aduana Local" value={formData.aduanaLocal} onChange={handleInputChange} />
                    <InputField id="aduanaDestino" label="Aduana de Destino" value={formData.aduanaDestino} onChange={handleInputChange} />
                    <InputField id="dataInicioViagem" label="Data de Início da Viagem" type="date" value={formData.dataInicioViagem} onChange={handleInputChange} />
                    <InputField id="dataEstimadaChegada" label="Data Estimada de Chegada" type="date" value={formData.dataEstimadaChegada} onChange={handleInputChange} />
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Gerando...
                            </>
                        ) : (
                           <>
                            <SparklesIcon className="w-5 h-5 mr-2"/>
                             Gerar Tracking
                           </>
                        )}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </form>
            </div>
            <SavedTrackingsList 
                trackings={savedTrackings}
                onLoad={handleLoad}
                onDelete={handleDelete}
                activeTrackingId={activeTrackingId}
            />
        </div>

        <div className="lg:col-span-8">
            <div className="sticky top-8">
                {trackingData && (
                    <div className="mb-4 flex justify-end no-print">
                        <button 
                            onClick={handleSave}
                            disabled={isCurrentTrackingSaved}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                           {isCurrentTrackingSaved ? 'Salvo' : 'Salvar Tracking'}
                        </button>
                    </div>
                )}
                <TrackingCard 
                    trackingData={trackingData} 
                    onPrint={handlePrint} 
                    onCopy={handleCopy} 
                    copyStatus={copyStatus}
                    newMovement={newMovement}
                    onNewMovementChange={setNewMovement}
                    onAddMovement={handleAddMovement}
                    onPredictMovement={handlePredictMovement}
                    isPredicting={isPredicting}
                    onDeleteLastMovement={handleDeleteLastMovement}
                    onAddMovementFromStage={handleAddMovementFromStage}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
