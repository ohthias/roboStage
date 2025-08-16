"use client";

export default function ComingSoon() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
      <img src="/protoboard.gif" alt="robo" className="max-w-50 h-auto"/>
      <div className="space-y-2 bg-base-200 p-4 rounded-lg shadow">
        <h1 className="text-5xl font-bold mb-4 text-center text-info">Em Breve</h1>
        <p className="text-lg text-center max-w-md mb-6 text-base-content">
          Estamos preparando algo incrível! Fique atento para novidades.
        </p>
      </div>
    </div>
  );
}
