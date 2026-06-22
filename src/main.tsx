import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DialogProvider } from './components/CustomDialogContext.tsx';
import { aiPilotEngine } from './engine/AIPilotEngine';

// Start the background engine for platform-wide automated tasks.
aiPilotEngine.start();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DialogProvider>
      <App />
    </DialogProvider>
  </StrictMode>,
);
