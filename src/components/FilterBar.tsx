import React from 'react';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  idPrefix?: string;
}

export const FilterBar: React.FC<Props> = ({
  options,
  selectedId,
  onSelect,
  idPrefix = 'filter-tab',
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {options.map((opt) => {
        const isActive = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            id={`${idPrefix}-${opt.id}`}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] ${
                  isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
