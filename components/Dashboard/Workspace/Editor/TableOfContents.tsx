import React, { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { $isHeadingNode } from "@lexical/rich-text";

interface Heading {
  key: string;
  text: string;
  tag: string;
  indent: number;
}

export default function TableOfContents() {
  const [editor] = useLexicalComposerContext();
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Function to extract headings
    function updateHeadings() {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();
        const results: Heading[] = [];

        for (const node of children) {
          if ($isHeadingNode(node)) {
            const tag = node.getTag();
            const text = node.getTextContent();
            
            // Skip empty headings
            if (text.trim().length === 0) continue;

            let indent = 0;
            if (tag === 'h2') indent = 1;
            if (tag === 'h3') indent = 2;
            if (tag === 'h4') indent = 3;

            results.push({ key: node.getKey(), text, tag, indent });
          }
        }
        setHeadings(results);
      });
    }

    // Initial load
    updateHeadings();

    // Listen for updates
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // Only update if content changed
      if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
        updateHeadings();
      }
    });
  }, [editor]);

  if (headings.length === 0) return null;

  const scrollToHeading = (key: string) => {
    editor.getEditorState().read(() => {
      const element = editor.getElementByKey(key);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  return (
    <div className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto pl-4 border-l border-gray-100 animate-in fade-in duration-500">
      <div className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider select-none">
        On this page
      </div>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li
            key={h.key}
            className={`
              text-sm cursor-pointer transition-colors truncate
              ${h.indent === 0 ? 'font-medium text-gray-700 hover:text-black' : 'text-gray-500 hover:text-gray-800'}
            `}
            style={{ 
              paddingLeft: `${h.indent * 12}px`,
              fontSize: h.indent === 0 ? '14px' : '13px'
            }}
            onClick={() => scrollToHeading(h.key)}
          >
            {h.text}
          </li>
        ))}
      </ul>
    </div>
  );
}