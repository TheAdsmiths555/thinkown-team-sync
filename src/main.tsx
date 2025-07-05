import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </>
);
