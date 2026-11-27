import React from 'react';
import { Impacto, Probabilidade, Risco } from '@/features/quickbrick/matriz-risco/types';
import { IMPACTO_LABELS, PROBABILIDADE_LABELS, getRiskColor } from '@/features/quickbrick/matriz-risco/lib/constants';
import RiscoCard from './RiscoCard';

interface MatrizRiscoProps {
  riscos: Risco[];
  onDropRisco: (riskId: number, impacto: Impacto, probabilidade: Probabilidade) => void;
  onEditRisco: (risco: Risco) => void;
  onRemoveRisco: (riskId: number) => void;
  onViewRisco: (risco: Risco) => void;
}

const MatrizRisco = React.forwardRef<HTMLDivElement, MatrizRiscoProps>(
  ({ riscos, onDropRisco, onEditRisco, onRemoveRisco, onViewRisco }, ref) => {
    const impactoLevels = Object.values(Impacto).filter(v => typeof v === 'number').map(v => v as Impacto).reverse();
    const probabilidadeLevels = Object.values(Probabilidade).filter(v => typeof v === 'number').map(v => v as Probabilidade);
    const [dragOverCell, setDragOverCell] = React.useState<{ impacto: Impacto; prob: Probabilidade } | null>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, impacto: Impacto, probabilidade: Probabilidade) => {
      e.preventDefault();
      const riskId = parseInt(e.dataTransfer.getData('riskId'), 10);
      if (!isNaN(riskId)) {
        onDropRisco(riskId, impacto, probabilidade);
      }
      setDragOverCell(null);
    };

    return (
      <div ref={ref} className="mx-auto w-full bg-base-100 p-4">
        <div 
          role="grid" 
          aria-label="Matriz de Risco"
          aria-rowcount={impactoLevels.length}
          aria-colcount={probabilidadeLevels.length}
          className="grid" 
          style={{ gridTemplateColumns: 'auto repeat(5, 1fr)', gridTemplateRows: 'auto auto repeat(5, 1fr)' }}
        >
            
            {/* Canto Vazio e Label PROBABILIDADE */}
            <div style={{ gridColumn: '1', gridRow: '1 / 3' }} aria-hidden="true"></div>
            <div className="col-span-5 p-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-base-content/55" style={{ gridColumn: '2 / 7', gridRow: '1' }} aria-hidden="true">
                PROBABILIDADE
            </div>

            {/* Label IMPACTO */}
            <div className="row-span-5 flex items-center justify-start pl-4" style={{ gridColumn: '1', gridRow: '3 / 8' }} aria-hidden="true">
              <div className="origin-left -rotate-90 transform text-[11px] font-semibold uppercase tracking-[0.2em] text-base-content/55">
                IMPACTO
              </div>
            </div>

            {/* Cabeçalhos da Probabilidade */}
            {probabilidadeLevels.map((prob, index) => (
                <div key={prob} role="columnheader" className="p-2 text-center text-[13px] font-bold text-base-content/80" style={{ gridColumn: `${index + 2}`, gridRow: '2' }}>
                    {PROBABILIDADE_LABELS[prob]}
                </div>
            ))}

            {/* Cabeçalhos do Impacto */}
            {impactoLevels.map((impacto, index) => (
                <div key={impacto} role="rowheader" className="flex items-center justify-end p-2 text-right text-[13px] font-bold text-base-content/80" style={{ gridColumn: '1', gridRow: `${index + 3}` }}>
                    {IMPACTO_LABELS[impacto]}
                </div>
            ))}
            
            {/* Células da Matriz */}
            {impactoLevels.map((impacto, rowIndex) =>
                probabilidadeLevels.map((prob, colIndex) => {
                    const isDragOver = dragOverCell?.impacto === impacto && dragOverCell?.prob === prob;
                    return (
                        <div
                            key={`${impacto}-${prob}`}
                            role="gridcell"
                            aria-label={`Impacto ${IMPACTO_LABELS[impacto]}, Probabilidade ${PROBABILIDADE_LABELS[prob]}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, impacto, prob)}
                            onDragEnter={() => setDragOverCell({ impacto, prob })}
                            onDragLeave={() => setDragOverCell(null)}
                            className={`m-0.5 min-h-[100px] rounded-md border p-1 transition-all duration-200 ${getRiskColor(impacto, prob)} ${isDragOver ? 'ring-2 ring-primary ring-offset-1 ring-offset-base-100' : ''}`}
                            style={{ gridColumn: `${colIndex + 2}`, gridRow: `${rowIndex + 3}` }}
                        >
                            {riscos
                                .filter(r => r.impacto === impacto && r.probabilidade === prob)
                                .map(risco => (
                                    <RiscoCard key={risco.id} risco={risco} onEdit={onEditRisco} onRemove={onRemoveRisco} onView={onViewRisco} />
                                ))}
                        </div>
                    );
                })
            )}
        </div>
      </div>
    );
  }
);

export default MatrizRisco;