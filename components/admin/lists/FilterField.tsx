'use client';

export interface ListFilterSelectOption {
  value: string;
  label: string;
}

export type ListFilterField =
  | {
      kind: 'select';
      key: string;
      label: string;
      options: ListFilterSelectOption[];
    }
  | {
      /** Options are loaded from `/genres`; values are genre ids. */
      kind: 'genres';
      key: string;
      label: string;
    }
  | {
      kind: 'number';
      key: string;
      label: string;
      placeholder?: string;
    };

export const FILTER_SELECT_CLASS =
  'bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/60 focus:border-red-500/50 cursor-pointer';

interface FilterFieldProps {
  field: ListFilterField;
  value: string;
  onChange: (nextValue: string) => void;
  /** Resolved options for `kind: 'genres'` fields. */
  genreOptions: ListFilterSelectOption[];
}

/** Single labeled control inside the filter popover. */
export function FilterField({ field, value, onChange, genreOptions }: FilterFieldProps) {
  const options =
    field.kind === 'genres' ? genreOptions : field.kind === 'select' ? field.options : [];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        {field.label}
      </label>

      {field.kind === 'number' ? (
        <input
          type="number"
          placeholder={field.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={FILTER_SELECT_CLASS}
        />
      ) : (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={FILTER_SELECT_CLASS}
        >
          <option value="">All {field.label}s</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
