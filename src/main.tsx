import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initAdfixusEmbed } from '@/core/embed/embed';

createRoot(document.getElementById("root")!).render(<App />);

initAdfixusEmbed({ appName: 'AdFixus-CAPI-Calculator' });
