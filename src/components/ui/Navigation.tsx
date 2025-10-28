import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isLoggingOut } = useAuth();

  const isDashboard = location.pathname === '/dashboard';
  const isRegister = location.pathname === '/register';
  const isSearch = location.pathname === '/search';
  const isHistory = location.pathname === '/history';

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 ">
                Ferracini <span className="text-blue-600">CRM</span>
              </h2>
            </div>
          </div>

          {/* Tabs de Navegação */}
          <div className="flex justify-around sm:justify-center sm:space-x-1 bg-gray-100 rounded-t-lg sm:rounded-lg px-2 sm:px-1 py-1 sm:py-1 fixed sm:sticky sm:top-0 bottom-0 right-0 left-0 z-50 border-t sm:border-0 border-gray-200 shadow-lg sm:shadow-none">
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex flex-col sm:flex-row items-center gap-0.5 px-3 sm:px-6 py-2 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                isDashboard
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 sm:hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-tachometer-alt text-xl sm:text-base pr-1"></i>
              <span className="text-[10px] sm:text-sm">Painel</span>
            </button>

            <button
              onClick={() => navigate('/register')}
              className={`flex flex-col sm:flex-row items-center gap-0.5 px-3 sm:px-6 py-2 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                isRegister
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 sm:hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-user-plus text-xl sm:text-base pr-1"></i>
              <span className="text-[10px] sm:text-sm">Cadastrar</span>
            </button>

            <button
              onClick={() => navigate('/search')}
              className={`flex flex-col sm:flex-row items-center gap-0.5 px-3 sm:px-6 py-2 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                isSearch
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 sm:hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-magnifying-glass text-xl sm:text-base pr-1"></i>
              <span className="text-[10px] sm:text-sm">Buscar</span>
            </button>

            <button
              onClick={() => navigate('/history')}
              className={`flex flex-col sm:flex-row items-center gap-0.5 px-3 sm:px-6 py-2 sm:py-2 rounded-md text-sm sm:text-base font-medium transition-all duration-200 cursor-pointer ${
                isHistory
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 sm:hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-clock-rotate-left text-xl sm:text-base pr-1"></i>
              <span className="text-[10px] sm:text-sm">Histórico</span>
            </button>
          </div>

          {/* Botão Sair */}
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="inline-flex items-center px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            title="Sair do sistema"
          >
            {isLoggingOut ? (
              <i className="fa-solid fa-spinner fa-spin text-lg"></i>
            ) : (
              <i className="fa-solid fa-person-walking-arrow-right text-lg"></i>
            )}
            <span className="ml-2 hidden sm:inline">
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Navigation;
