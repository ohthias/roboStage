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
    <div className="divide-y divide-base-300 border border-base-200 rounded-md">
      {items.map((item, i) => (
        <div key={i} className="collapse collapse-arrow">
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
