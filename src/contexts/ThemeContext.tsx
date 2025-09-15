import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: 'normal' | 'large' | 'x-large';
  setFontSize: (size: 'normal' | 'large' | 'x-large') => void;
  animations: boolean;
  toggleAnimations: () => void;
  dataSaver: boolean;
  toggleDataSaver: () => void;
  tabletMode: boolean;
  toggleTabletMode: () => void;
  menuVisible: boolean;
  toggleMenuVisibility: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme_settings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaults = {
      theme: prefersDark ? 'dark' : 'light',
      highContrast: false,
      fontSize: 'normal',
      animations: true,
      dataSaver: false,
      tabletMode: false,
      menuVisible: true,
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    document.documentElement.classList.remove('text-normal', 'text-large', 'text-x-large');
    document.documentElement.classList.add(`text-${settings.fontSize}`);

    if (!settings.animations) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }

    if (settings.tabletMode) {
      document.documentElement.classList.add('tablet-mode');
    } else {
      document.documentElement.classList.remove('tablet-mode');
    }
  }, [settings]);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const setFontSize = (fontSize: 'normal' | 'large' | 'x-large') => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const toggleAnimations = () => {
    setSettings(prev => ({ ...prev, animations: !prev.animations }));
  };

  const toggleDataSaver = () => {
    setSettings(prev => ({ ...prev, dataSaver: !prev.dataSaver }));
  };

  const toggleTabletMode = () => {
    setSettings(prev => ({ ...prev, tabletMode: !prev.tabletMode }));
  };

  const toggleMenuVisibility = () => {
    setSettings(prev => ({ ...prev, menuVisible: !prev.menuVisible }));
  };

  return (
    <ThemeContext.Provider value={{
      theme: settings.theme as Theme,
      toggleTheme,
      highContrast: settings.highContrast,
      toggleHighContrast,
      fontSize: settings.fontSize as 'normal' | 'large' | 'x-large',
      setFontSize,
      animations: settings.animations,
      toggleAnimations,
      dataSaver: settings.dataSaver,
      toggleDataSaver,
      tabletMode: settings.tabletMode,
      toggleTabletMode,
      menuVisible: settings.menuVisible,
      toggleMenuVisibility,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}