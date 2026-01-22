import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './AppWithAuth.jsx'  // This is your new entry point
//import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)