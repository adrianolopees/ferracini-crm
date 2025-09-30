import { Routes, Route, Navigate } from 'react-router-dom';
import Cadastro from './pages/RegisterCustomer';
import Busca from './pages/SearchCustomers';
import RegisterCustomer from './pages/RegisterCustomer';
import SearchCustomers from './pages/SearchCustomers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<RegisterCustomer />} />
      <Route path="/search" element={<SearchCustomers />} />
    </Routes>
  );
}

export default App;
