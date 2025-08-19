import { ReactNode } from "react";

interface CardProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function Card({ title, description, children }: CardProps) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-200">
      <div className="card-body">
        <h2 className="card-title text-lg">{title}</h2>
        <p className="mb-4">{description}</p>
        {children}
      </div>
    </div>
  );
}
