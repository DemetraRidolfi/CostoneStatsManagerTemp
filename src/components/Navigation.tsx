import { useLocation } from 'react-router-dom';
import { Home, PlusCircle, History, BarChart2, Users, Settings, LogOut, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';

export default function Navigation() {
  const location = useLocation();
  const { menuVisible, toggleMenuVisibility } = useTheme();
  const { logout } = useAuth();
  const { handleNavigation } = useNavigation();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: PlusCircle, label: 'Nuova Partita', path: '/new-game' },
    { icon: History, label: 'Archivio Partite', path: '/games' },
    { icon: BarChart2, label: 'Statistiche', path: '/stats' },
    { icon: Users, label: 'Gestione Squadra', path: '/team' },
    { icon: Settings, label: 'Impostazioni', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    handleNavigation('/login');
  };

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        onClick={toggleMenuVisibility}
        className="fixed top-2 right-2 z-50 p-2 bg-primary-600 dark:bg-primary-900 text-white rounded-lg shadow-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
      >
        {menuVisible ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Navigation Bar */}
      <nav className={`bg-primary-600 dark:bg-primary-900 shadow-lg transition-all duration-300 ${
        menuVisible ? 'translate-y-0' : '-translate-y-full'
      } sticky top-0 z-40 w-full overflow-x-auto`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between min-w-max w-full">
            <div className="flex space-x-4">
              {navItems.map(({ icon: Icon, label, path }) => (
                <button
                  key={path}
                  onClick={() => handleNavigation(path)}
                  className={`flex items-center h-14 px-4 text-sm font-medium whitespace-nowrap ${
                    location.pathname === path
                      ? 'text-white border-b-2 border-white'
                      : 'text-primary-100 hover:text-white hover:border-b-2 hover:border-primary-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4 mr-12">
              <button
                onClick={handleLogout}
                className="flex items-center h-14 px-4 text-sm font-medium text-primary-100 hover:text-white hover:border-b-2 hover:border-primary-100 whitespace-nowrap"
                title="Logout"
              >
                <LogOut className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer for content adjustment */}
      <div className={`transition-all duration-300 ${!menuVisible ? '-mt-16' : ''}`} />
    </>
  );
}