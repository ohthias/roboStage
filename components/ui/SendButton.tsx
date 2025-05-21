import React from "react";

const SendButton = () => {
  return (
    <button className="text-xl w-32 h-12 rounded bg-primary text-white relative overflow-hidden group z-10 hover:text-white duration-1000">
      <span className="absolute bg-primary-light w-36 h-36 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all" />
      <span className="absolute bg-primary-dark w-36 h-36 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all" />
      Enviar
    </button>
  );
};

export default SendButton;
