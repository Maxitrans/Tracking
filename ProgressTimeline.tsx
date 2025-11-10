
import React from 'react';
import type { Movement } from '../types';
import { CheckIcon } from './IconComponents';

export const stages = [
  { name: 'Início de Trânsito', keywords: ['início', 'iniciado', 'criado', 'coletado', 'origem'] },
  { name: 'Trânsito para Fronteira', keywords: ['trânsito para fronteira', 'indo para', 'a caminho da fronteira'] },
  { name: 'Fronteira Origem', keywords: ['fronteira de origem', 'aduana local', 'saída do país', 'liberado para exportação'] },
  { name: 'Cruzamento Fronteira', keywords: ['cruzamento', 'cruze', 'crossing', 'trânsito internacional'] },
  { name: 'Fronteira Destino', keywords: ['fronteira de destino', 'chegada no país', 'chegou na fronteira'] },
  { name: 'Aduana Destino', keywords: ['aduana de destino', 'liberação alfandegária', 'desembaraço', 'fiscalização'] },
  { name: 'Entrega Finalizada', keywords: ['descarregada', 'entregue', 'finalizada', 'destino final'] },
];

const getCurrentStageIndex = (movements: Movement[]): number => {
  if (!movements || movements.length === 0) {
    return -1;
  }

  const latestMovementDescription = movements[movements.length - 1].description.toLowerCase();
  
  let currentStage = -1;

  // Find the most advanced stage that matches the latest movement
  for (let i = stages.length - 1; i >= 0; i--) {
    if (stages[i].keywords.some(keyword => latestMovementDescription.includes(keyword))) {
      currentStage = i;
      break;
    }
  }

  // If no match, but there are movements, assume the first stage
  if (currentStage === -1 && movements.length > 0) {
    return 0;
  }

  return currentStage;
};


const ProgressTimeline: React.FC<{ movements: Movement[] }> = ({ movements }) => {
  const currentStageIndex = getCurrentStageIndex(movements);

  const getStatusClasses = (index: number) => {
    if (index < currentStageIndex) {
      return {
        dot: 'bg-green-500',
        text: 'text-gray-900 dark:text-white',
        line: 'bg-green-500'
      };
    }
    if (index === currentStageIndex) {
      return {
        dot: 'bg-blue-500 ring-4 ring-blue-200 dark:ring-blue-900',
        text: 'text-blue-600 dark:text-blue-400 font-semibold',
        line: 'bg-gray-200 dark:bg-gray-700'
      };
    }
    return {
      dot: 'bg-gray-300 dark:bg-gray-600',
      text: 'text-gray-400 dark:text-gray-500',
      line: 'bg-gray-200 dark:bg-gray-700'
    };
  };

  return (
    <div className="my-6 py-6 border-t border-b border-gray-200 dark:border-gray-700">
      <h4 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200 text-center">Linha do Tempo</h4>
      <ol className="items-center sm:flex justify-between">
        {stages.map((stage, index) => {
          const status = getStatusClasses(index);
          const isCompleted = index < currentStageIndex;
          
          return (
            <li key={stage.name} className="relative mb-6 sm:mb-0 w-full">
              <div className="flex items-center">
                <div className={`z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${status.dot}`}>
                  {isCompleted ? (
                    <CheckIcon className="w-5 h-5 text-white" />
                  ) : null}
                </div>
                {index < stages.length - 1 && (
                  <div className={`hidden sm:flex w-full h-1 transition-colors ${index < currentStageIndex ? status.line : getStatusClasses(index).line}`}></div>
                )}
              </div>
              <div className="mt-3 sm:pr-8">
                <h3 className={`text-sm text-center sm:text-left ${status.text}`}>{stage.name}</h3>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProgressTimeline;
