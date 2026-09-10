import React from 'react'
import ReactDOM from 'react-dom/client'
import TranquiFinanzasApp from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TranquiFinanzasApp />      
    </ErrorBoundary>
  </React.StrictMode>,
)