import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import './styles/variables.css';
import './index.css';

import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/landing.css';
import './styles/profile.css';
import './styles/notifications.css';

import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="top-right" reverseOrder={false} />
  </React.StrictMode>
);