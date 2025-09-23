import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

type PageContainerProps = {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
};

export default function PageContainer({ children, title, actions }: PageContainerProps) {
  const { menuVisible } = useTheme();

  return (
    <div className={`max-w-6xl mx-auto px-4 transition-all duration-300 pt-8`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-8">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          )}
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}