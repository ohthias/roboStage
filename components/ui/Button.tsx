import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-block rounded-md w-max border border-current px-8 py-3 text-sm font-medium text-primary transition hover:scale-110 hover:shadow-xl focus:ring-3 focus:outline-hidden"
    >
      {text}
    </button>
  );
};

export default Button;
