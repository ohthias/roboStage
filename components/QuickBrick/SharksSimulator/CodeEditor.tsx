import React from 'react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange }) => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 relative">
        <textarea
            className="w-full h-full bg-transparent text-slate-300 p-4 font-mono text-xs resize-none focus:outline-none leading-relaxed selection:bg-cyan-500/30 placeholder-slate-700"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            placeholder="// Digite seus comandos aqui..."
        />
      </div>
    </div>
  );
};

export default CodeEditor;
