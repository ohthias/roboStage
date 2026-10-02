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
    setOpenIndex((current) => (current === index ? null : index));
  };

  if (!items?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={`${item.title}-${index}`}
            className={`rounded-xl border border-base-300 bg-base-200/30 overflow-hidden transition-all duration-200 ${isOpen ? "bg-base-200/60 shadow-sm" : ""}`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${index}`}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-medium transition-colors hover:bg-base-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            >
              <span className="text-base-content">{item.title}</span>

              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-base-100 text-base-content/60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>

            <div
              id={`accordion-content-${index}`}
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-base-300 px-4 pb-5 pt-4">
                  <div className="whitespace-pre-line text-sm leading-7 text-base-content/70 sm:text-base">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}