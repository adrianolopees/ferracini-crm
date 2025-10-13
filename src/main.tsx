import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from '@/App.js';
import '@/styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff', // Cor de fundo
            color: '#333', // Cor do texto
            fontSize: '18px', // Tamanho da fonte (adicione isso!)
            padding: '20px 30px', // Espaçamento interno (adicione isso!)
            borderRadius: '12px', // Bordas arredondadas
            boxShadow: '...', // Sombra
            minWidth: '350px', // Largura mínima (adicione isso!)
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: {
              border: '2px solid #10b981',
            },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
