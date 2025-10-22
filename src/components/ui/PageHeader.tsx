import { ReactNode } from 'react';

interface PageHeaderProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  color?: string;
  highlight: string;
}

export function PageHeader({
  title,
  subtitle,
  color = 'text-blue-600',
  highlight,
}: PageHeaderProps) {
  return (
    <div className="text-center mb-8 mt-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
        {title} <span className={color}>{highlight}</span>
      </h1>
      <p className="text-gray-600 text-lg">{subtitle}</p>
    </div>
  );
}
