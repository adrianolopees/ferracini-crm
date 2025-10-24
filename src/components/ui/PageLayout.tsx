import { ReactNode } from 'react';
import { Navigation, PageHeader } from './index';
import { AnimatedContainer } from '../animations';

interface PageLayoutProps {
  title: string;
  highlight: string;
  subtitle: string;
  color?: string;
  maxWidth?: '2xl' | '4xl' | '5xl' | 'none';
  children: ReactNode;
}

function PageLayout({
  title,
  highlight,
  subtitle,
  color,
  maxWidth = '4xl',
  children,
}: PageLayoutProps) {
  // Map maxWidth values to complete Tailwind classes
  const maxWidthClasses = {
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    'none': ''
  };

  const maxWidthClass = maxWidthClasses[maxWidth];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Navigation />
      <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4 pb-20 sm:pb-8">
        <div className={maxWidth === 'none' ? '' : `${maxWidthClass} mx-auto`}>
          {/* Header */}
          <AnimatedContainer type="slideDown">
            <PageHeader
              title={title}
              highlight={highlight}
              subtitle={subtitle}
              color={color}
            />
          </AnimatedContainer>

          {/* Conteúdo da página */}
          {children}
        </div>
      </div>
    </div>
  );
}

export default PageLayout;
