
import React from 'react';
import type { TrackingData } from '../types';
import { TrashIcon, UploadCloudIcon } from './IconComponents';

interface SavedTrackingsListProps {
  trackings: TrackingData[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  activeTrackingId?: string;
}

const SavedTrackingsList: React.FC<SavedTrackingsListProps> = ({ trackings, onLoad, onDelete, activeTrackingId }) => {
  if (trackings.length === 0) {
    return null; // Don't render the component if there are no saved trackings
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold mb-4">Trackings Salvos</h3>
      {trackings.length > 0 ? (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {trackings.map((tracking) => (
            <li 
              key={tracking.id} 
              className={`p-3 rounded-lg flex justify-between items-center transition-colors ${activeTrackingId === tracking.id ? 'bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500' : 'bg-gray-50 dark:bg-gray-700/50'}`}
            >
              <div className="truncate">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">{tracking.exportador}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  CRT: {tracking.crt}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0 ml-2">
                <button 
                  onClick={() => onLoad(tracking.id)}
                  title="Carregar Tracking"
                  className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <UploadCloudIcon className="w-5 h-5"/>
                </button>
                <button 
                  onClick={() => onDelete(tracking.id)}
                  title="Deletar Tracking"
                  className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum tracking salvo ainda.</p>
      )}
    </div>
  );
};

export default SavedTrackingsList;
