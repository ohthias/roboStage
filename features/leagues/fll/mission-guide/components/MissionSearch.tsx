interface MissionSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MissionSearch({ value, onChange }: MissionSearchProps) {
  return (
    <label className="input input-bordered flex w-full items-center gap-2 flex-1 py-2 px-3 sm:w-auto" aria-label="Buscar missão">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-4 w-4 opacity-50"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar missão..."
        aria-label="Buscar missão por ID, nome ou descrição"
        className="grow"
      />
    </label>
  );
}
