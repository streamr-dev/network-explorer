import '@ibm/plex/css/ibm-plex.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './components/App'
import './index.css'

createRoot(document.getElementById('root')!).render(<App />)
