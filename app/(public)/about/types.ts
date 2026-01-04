
import { LucideIcon } from 'lucide-react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
}

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
}