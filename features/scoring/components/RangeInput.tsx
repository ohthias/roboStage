export function RangeInput({
  missionId,
  index,
  start = 0,
  end = 10,
  value,
  onSelect,
}: RangeInputProps) {
  const count = end - start + 1;

  return (
    <div className="flex flex-wrap gap-2 mt-2" role="radiogroup">
      {Array.from({ length: count }, (_, idx) => (
        <button
          key={`${missionId}-range-${index}-${idx}`}
          className={`btn btn-md rounded-lg ${value === idx ? "btn-primary" : "btn-default"}`}
          onClick={() => onSelect(missionId, index, idx)}
          aria-pressed={value === idx}
          type="button"
        >
          {start + idx}
        </button>
      ))}
    </div>
  );
}