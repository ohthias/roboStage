export function SwitchInput({
  missionId,
  index,
  options,
  value,
  onSelect,
}: SwitchInputProps) {
  const labels = options?.length ? options : ["Não", "Sim"];

  return (
    <div className="flex flex-wrap mt-2 gap-2" role="radiogroup">
      {labels.map((label, idx) => (
        <button
          key={`${missionId}-switch-${index}-${idx}`}
          className={`btn btn-md rounded-lg ${value === idx ? "btn-primary" : "btn-default"}`}
          onClick={() => onSelect(missionId, index, idx)}
          aria-pressed={value === idx}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}