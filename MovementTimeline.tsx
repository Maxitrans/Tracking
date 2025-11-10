
import React from 'react';
import type { Movement } from '../types';

interface MovementTimelineProps {
  movements: Movement[];
}

const MovementTimeline: React.FC<MovementTimelineProps> = ({ movements }) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Histórico de Movimentos</h4>
      <div className="relative border-l-2 border-blue-200 dark:border-blue-800 ml-3">
        {movements.map((movement, index) => (
          <div key={index} className="mb-6 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800 dark:bg-blue-900">
              <svg className="w-3 h-3 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z" />
                <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
              </svg>
            </span>
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                <p className="text-base font-normal text-gray-700 dark:text-gray-200">{movement.description}</p>
                 <time className="block mt-2 text-xs font-normal leading-none text-gray-500 dark:text-gray-400">
                    {movement.timestamp.toLocaleDateString('pt-BR')} às {movement.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </time>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovementTimeline;
