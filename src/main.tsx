import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Chrome (and others) restore the previous scroll offset on a same-URL
// reload by default, regardless of URL hash — that's a separate mechanism
// from hash-anchor jumping, and it was still landing mid-page after reload
// even once the hash was gone. Opt out and force top-of-page.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
