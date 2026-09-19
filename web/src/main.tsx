import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './components/App.tsx'
import {isEnvBrowser} from './utils/misc';
import { VisibilityProvider } from './providers/visibilityProvider';

const root = document.getElementById('root');

if (isEnvBrowser()) {
    root!.style.backgroundImage = 'url("https://r2.fivemanage.com/bEdqELkPWSt1UTqgSLs0M/image46.png")';
    root!.style.backgroundSize = 'cover';
    root!.style.backgroundRepeat = 'no-repeat';
    root!.style.backgroundPosition = 'center';
}

createRoot(root!).render(
    <StrictMode>
        <VisibilityProvider>
            <App/>
        </VisibilityProvider>
    </StrictMode>,
)
