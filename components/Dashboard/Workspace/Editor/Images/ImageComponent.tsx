import React, { useRef, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { NodeKey, CLICK_COMMAND, COMMAND_PRIORITY_LOW, $getNodeByKey } from 'lexical';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { $isImageNode, ImageAlignment } from './ImageNode';

export default function ImageComponent({ 
    src, 
    altText, 
    nodeKey, 
    width, 
    height,
    alignment 
}: { 
    src: string, 
    altText: string, 
    nodeKey: NodeKey, 
    width: number | 'inherit', 
    height: number | 'inherit',
    alignment: ImageAlignment
}) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (payload: MouseEvent) => {
          if (payload.target === imageRef.current) {
            clearSelection();
            setSelected(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, setSelected, clearSelection]);

  const setAlignment = (newAlignment: ImageAlignment) => {
      editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
              node.setAlignment(newAlignment);
          }
      });
  };

  const handleResizeStart = (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsResizing(true);
      
      const image = imageRef.current;
      if (!image) return;

      const startX = event.clientX;
      const startWidth = image.clientWidth;

      const handleMouseMove = (e: MouseEvent) => {
          const currentX = e.clientX;
          const diff = currentX - startX;
          const newWidth = startWidth + diff;
          
          if (newWidth > 50) { // Minimum width constraint
             image.style.width = `${newWidth}px`;
          }
      };

      const handleMouseUp = (e: MouseEvent) => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          setIsResizing(false);

          // Update Lexical state with final width
          const finalWidth = image.style.width ? parseInt(image.style.width, 10) : startWidth;
          
          editor.update(() => {
             const node = $getNodeByKey(nodeKey);
             if ($isImageNode(node)) {
                 node.setWidthAndHeight(finalWidth, 'inherit');
             }
          });
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  // Determine flex alignment class
  let alignClass = 'justify-center';
  if (alignment === 'left') alignClass = 'justify-start';
  if (alignment === 'right') alignClass = 'justify-end';

  return (
    <div className={`relative my-6 flex ${alignClass} ${isSelected ? 'z-10' : ''} select-none`}>
      <div className={`relative group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded' : ''}`}>
        
        {/* Alignment Controls - Visible only when selected */}
        {isSelected && !isResizing && (
           <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center bg-white shadow-lg border border-gray-200 rounded-md p-1 gap-1 z-20 animate-in fade-in zoom-in-95 duration-100">
               <button 
                  onClick={() => setAlignment('left')}
                  className={`p-1.5 rounded transition-colors ${alignment === 'left' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Align Left"
               >
                   <AlignLeft size={16} />
               </button>
               <button 
                  onClick={() => setAlignment('center')}
                  className={`p-1.5 rounded transition-colors ${alignment === 'center' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Align Center"
               >
                   <AlignCenter size={16} />
               </button>
               <button 
                  onClick={() => setAlignment('right')}
                  className={`p-1.5 rounded transition-colors ${alignment === 'right' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  title="Align Right"
               >
                   <AlignRight size={16} />
               </button>
           </div>
        )}

        <img
            ref={imageRef}
            src={src}
            alt={altText}
            className="max-w-full h-auto rounded-lg shadow-sm block"
            style={{ 
                width: width === 'inherit' ? undefined : width, 
                height: height === 'inherit' ? undefined : height,
                cursor: isSelected ? 'default' : 'pointer',
                pointerEvents: isResizing ? 'none' : 'auto' // Prevent image dragging ghost while resizing
            }}
            draggable="false"
        />
        
        {/* Resize Handle */}
        {isSelected && (
            <div 
                className="absolute bottom-1 right-1 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize hover:scale-110 transition-transform shadow-sm z-20"
                onMouseDown={handleResizeStart}
                title="Drag to resize"
            />
        )}
      </div>
    </div>
  );
}