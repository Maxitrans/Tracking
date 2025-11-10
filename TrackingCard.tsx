
import React, { useState, useEffect } from 'react';
import type { TrackingData } from '../types';
import MovementTimeline from './MovementTimeline';
import ProgressTimeline, { stages } from './ProgressTimeline';
import { CalendarIcon, FileTextIcon, GlobeIcon, PackageIcon, CopyIcon, PrintIcon, StatusOnlineIcon, ShieldIcon, PlusCircleIcon, SparklesIcon, TrashIcon } from './IconComponents';

interface TrackingCardProps {
  trackingData: TrackingData | null;
  onPrint: () => void;
  onCopy: () => void;
  copyStatus: string;
  newMovement: string;
  onNewMovementChange: (value: string) => void;
  onAddMovement: () => void;
  onPredictMovement: () => void;
  isPredicting: boolean;
  onDeleteLastMovement: () => void;
  onAddMovementFromStage: (description: string) => void;
}

const InfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string | undefined }> = ({ icon, label, value }) => (
  <div className="flex flex-col">
    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
        {icon}
        {label}
    </div>
    <div className="text-base font-semibold text-gray-800 dark:text-gray-100 pl-7">
        {value || 'N/A'}
    </div>
  </div>
);


const TrackingCard: React.FC<TrackingCardProps> = ({ 
  trackingData, 
  onPrint, 
  onCopy, 
  copyStatus,
  newMovement,
  onNewMovementChange,
  onAddMovement,
  onPredictMovement,
  isPredicting,
  onDeleteLastMovement,
  onAddMovementFromStage
}) => {
  const [selectedStage, setSelectedStage] = useState<string>(stages[0]?.name || '');
  
  useEffect(() => {
    if (trackingData) {
      setSelectedStage(stages[0]?.name || '');
    }
  }, [trackingData]);

  if (!trackingData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <PackageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Aguardando Dados</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Preencha o formulário para gerar um novo tracking.</p>
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00'); // Treat date as local
    return date.toLocaleDateString('pt-BR');
  }

  const latestMovement = trackingData.movements?.[trackingData.movements.length - 1];

  return (
    <div id="tracking-card-printable" className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <header className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-6 flex justify-between items-start">
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tracking ID: {trackingData.id}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status da remessa</p>
        </div>
        <div className="flex gap-2 no-print">
            <button onClick={onPrint} title="Gerar PDF" className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                <PrintIcon className="w-5 h-5"/>
            </button>
            <div className="relative">
              <button onClick={onCopy} title="Copiar para E-mail" className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                  <CopyIcon className="w-5 h-5"/>
              </button>
              {copyStatus && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-gray-700 text-white px-2 py-1 rounded-md whitespace-nowrap">
                      {copyStatus}
                  </span>
              )}
            </div>
        </div>
      </header>
      
      {latestMovement && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-1">
              <StatusOnlineIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> 
            </div>
            <div>
              <p className="font-semibold text-blue-800 dark:text-blue-200">Status Atual:</p>
              <p className="text-gray-800 dark:text-gray-200">{latestMovement.description}</p>
              <time className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                {latestMovement.timestamp.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </time>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 mb-6">
        <InfoItem icon={<GlobeIcon className="w-5 h-5"/>} label="Origem" value={trackingData.origem} />
        <InfoItem icon={<GlobeIcon className="w-5 h-5"/>} label="Destino" value={trackingData.destino} />
        <InfoItem icon={<PackageIcon className="w-5 h-5"/>} label="Exportador" value={trackingData.exportador} />
        <InfoItem icon={<PackageIcon className="w-5 h-5"/>} label="Importador" value={trackingData.importador} />
        <InfoItem icon={<FileTextIcon className="w-5 h-5"/>} label="Invoice" value={trackingData.invoice} />
        <InfoItem icon={<FileTextIcon className="w-5 h-5"/>} label="CRT" value={trackingData.crt} />
        <InfoItem icon={<FileTextIcon className="w-5 h-5"/>} label="MIC/DTA" value={trackingData.mic} />
        <InfoItem icon={<ShieldIcon className="w-5 h-5"/>} label="Aduana Local" value={trackingData.aduanaLocal} />
        <InfoItem icon={<ShieldIcon className="w-5 h-5"/>} label="Aduana de Destino" value={trackingData.aduanaDestino} />
        <InfoItem icon={<CalendarIcon className="w-5 h-5"/>} label="Início da Viagem" value={formatDate(trackingData.dataInicioViagem)} />
        <InfoItem icon={<CalendarIcon className="w-5 h-5"/>} label="Chegada Estimada" value={formatDate(trackingData.dataEstimadaChegada)} />
      </div>

      <ProgressTimeline movements={trackingData.movements} />

      <MovementTimeline movements={trackingData.movements} />

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 no-print space-y-8">
        <div>
          <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Atualizar Status da Linha do Tempo</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecione uma etapa para adicionar como o movimento mais recente.</p>
          <div className="flex flex-col sm:flex-row gap-3">
              <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
              >
                  {stages.map((stage) => (
                      <option key={stage.name} value={stage.name}>
                          {stage.name}
                      </option>
                  ))}
              </select>
              <button
                  onClick={() => onAddMovementFromStage(selectedStage)}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors whitespace-nowrap"
              >
                  <PlusCircleIcon className="w-5 h-5 mr-2"/>
                  Atualizar Status
              </button>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Adicionar Movimento Customizado</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ou adicione uma atualização de status detalhada para este rastreamento.</p>
          <div className="space-y-3">
              <textarea
                  value={newMovement}
                  onChange={(e) => onNewMovementChange(e.target.value)}
                  placeholder="Ex: Chegada ao porto de destino e aguardando liberação alfandegária."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition h-24 resize-none"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      onClick={onPredictMovement}
                      disabled={isPredicting}
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isPredicting ? (
                          <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sugerindo...
                          </>
                      ) : (
                          <>
                              <SparklesIcon className="w-5 h-5 mr-2" />
                              Sugerir
                          </>
                      )}
                  </button>
                  <button
                      onClick={onAddMovement}
                      disabled={!newMovement.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                      <PlusCircleIcon className="w-5 h-5 mr-2"/>
                      Atualizar
                  </button>
                  <button
                      onClick={onDeleteLastMovement}
                      disabled={trackingData.movements.length <= 1}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                  >
                      <TrashIcon className="w-5 h-5 mr-2"/>
                      Deletar
                  </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingCard;
