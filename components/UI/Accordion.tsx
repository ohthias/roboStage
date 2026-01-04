"use client";
import { useState } from "react";

interface AccordionItem {
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="collapse bg-base-100 border border-base-300 transition-all duration-300 rounded-lg peer-checked:shadow-lg">
          <input
            type="checkbox"
            checked={openIndex === i}
            onChange={() => toggle(i)}
            className="peer"
          />
          <div className="collapse-title text-base font-medium">
            {item.title}
          </div>
          <div className="collapse-content whitespace-pre-line">
            <p>{item.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
