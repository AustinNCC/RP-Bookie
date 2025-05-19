import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash, GripVertical, Receipt } from 'lucide-react';
import { BetSelection, BetType } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import CustomerBalanceDisplay from './CustomerBalanceDisplay';

interface BetSlipProps {
  selections: BetSelection[];
  betType: BetType;
  wagerAmount: string;
  customerId: string;
  potentialPayout: number;
  onRemoveSelection: (index: number) => void;
  onReorderSelections: (newOrder: BetSelection[]) => void;
  onWagerChange: (amount: string) => void;
  onSubmit: () => void;
  onPreviewReceipt: () => void;
}

interface SortableSelectionProps {
  selection: BetSelection;
  index: number;
  onRemove: () => void;
}

const SortableSelection: React.FC<SortableSelectionProps> = ({ selection, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: selection.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <button
        type="button"
        className="text-gray-400 hover:text-white cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-1">
        <p className="text-sm text-gray-400">{selection.eventName}</p>
        <p className="font-medium text-white">{selection.selectionName}</p>
      </div>

      <div className="text-right">
        <p className="text-sm text-primary font-medium">{selection.odds}</p>
        <button
          type="button"
          className="text-red-400 hover:text-red-300 mt-1"
          onClick={onRemove}
        >
          <Trash size={14} />
        </button>
      </div>
    </div>
  );
};

const BetSlip: React.FC<BetSlipProps> = ({
  selections,
  betType,
  wagerAmount,
  customerId,
  potentialPayout,
  onRemoveSelection,
  onReorderSelections,
  onWagerChange,
  onSubmit,
  onPreviewReceipt
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (over && active.id !== over.id) {
      const oldIndex = selections.findIndex(s => s.id === active.id);
      const newIndex = selections.findIndex(s => s.id === over.id);

      const newSelections = [...selections];
      const [movedSelection] = newSelections.splice(oldIndex, 1);
      newSelections.splice(newIndex, 0, movedSelection);

      onReorderSelections(newSelections);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Bet Slip</h3>
        <CustomerBalanceDisplay customerId={customerId} />
      </div>

      {selections.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          Select options to add to your bet slip
        </div>
      ) : (
        <DndContext
          sensors={[]}
          collisionDetection={closestCenter}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className={`space-y-2 ${isDragging ? 'cursor-grabbing' : ''}`}>
              {selections.map((selection, index) => (
                <SortableSelection
                  key={selection.id}
                  selection={selection}
                  index={index}
                  onRemove={() => onRemoveSelection(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {selections.length > 0 && (
        <>
          <div>
            <label htmlFor="wagerAmount" className="label">
              Wager Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">$</span>
              </div>
              <input
                type="number"
                id="wagerAmount"
                value={wagerAmount}
                onChange={(e) => onWagerChange(e.target.value)}
                className="input pl-7"
                placeholder="0"
                min="0"
                step="10"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-800/30 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Type:</span>
              <span className="text-white font-medium">{betType}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Wager:</span>
              <span className="text-white">
                {wagerAmount ? formatCurrency(parseFloat(wagerAmount)) : '$0'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Potential Payout:</span>
              <span className="text-lg font-semibold text-primary">
                {formatCurrency(potentialPayout)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
              onClick={onPreviewReceipt}
            >
              <Receipt size={18} />
              Preview
            </button>

            <button
              type="button"
              className="btn-primary flex-1"
              onClick={onSubmit}
            >
              Place Bet
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BetSlip;