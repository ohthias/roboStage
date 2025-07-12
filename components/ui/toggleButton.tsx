interface ToggleSwitchProp {
  isOn : boolean;
  onClick: () => void;
}

export default function ToggleSwitch({onClick, isOn} : ToggleSwitchProp) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onClick}
        className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer ${
          isOn ? 'bg-primary-dark' : 'bg-gray-300'
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
            isOn ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
