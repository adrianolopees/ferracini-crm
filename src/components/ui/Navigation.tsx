import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isRegister = location.pathname === '/register';
  const isSearch = location.pathname === '/search';

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                Ferracini <span className="text-blue-600">CRM</span>
              </h2>
            </div>
          </div>

          {/* Tabs de Navegação */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => navigate('/register')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                isRegister
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="bi bi-person-plus mr-2"></i>
              Cadastrar
            </button>
            <button
              onClick={() => navigate('/search')}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 cursor-pointer ${
                isSearch
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="bi bi-search mr-2"></i>
              Buscar
            </button>
          </div>

          {/* Botão Sair */}
          <button
            onClick={() => logout()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
            title="Sair do sistema"
          >
            <i className="bi bi-box-arrow-right text-lg"></i>
            <span className="ml-2 hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
