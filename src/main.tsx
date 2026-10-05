import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Automatically purge stale demo cache on mobile browsers before app boots
try {
  const rawAuth = localStorage.getItem('kiki-auth-storage');
  if (rawAuth && (rawAuth.includes('มินตรา') || rawAuth.includes('demo_customer_line_id'))) {
    localStorage.removeItem('kiki-auth-storage');
  }
} catch (e) {
  console.warn(e);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
