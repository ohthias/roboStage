
import { FeatureCardProps } from '@/app/(public)/about/types';
import React from 'react';

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, colorClass }) => {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-200 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 group">
      <div className="card-body p-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${colorClass}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="card-title text-2xl font-black text-base-content group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-base-content/70 leading-relaxed mt-2">
          {description}
        </p>
      </div>
    </div>
  );
};