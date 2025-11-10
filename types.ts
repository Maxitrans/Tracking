export interface TrackingData {
  id: string;
  origem: string;
  destino: string;
  exportador: string;
  importador: string;
  invoice: string;
  crt: string;
  mic: string;
  dataInicioViagem: string;
  dataEstimadaChegada: string;
  aduanaLocal: string;
  aduanaDestino: string;
  movements: Movement[];
}

export interface Movement {
  timestamp: Date;
  description: string;
}