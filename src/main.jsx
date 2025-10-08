import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

try {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error("Erro fatal na inicialização da aplicação:", error);
  document.getElementById("root").innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #f8d7da; color: #721c24; font-family: sans-serif; padding: 20px; text-align: center;">
      <h1 style="font-size: 2em; margin-bottom: 10px;">Oops! Algo deu errado.</h1>
      <p style="font-size: 1.2em; margin-bottom: 20px;">Um erro inesperado ocorreu na aplicação.</p>
      <pre style="background-color: #f5c6cb; border: 1px solid #dc3545; padding: 15px; border-radius: 5px; white-space: pre-wrap; text-align: left;"><code>${error.stack || error.message}</code></pre>
      <p style="margin-top: 20px;">Por favor, tente novamente mais tarde ou entre em contato com o suporte.</p>
    </div>
  `;
}
