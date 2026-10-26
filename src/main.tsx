import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ProjectProvider } from './context/ProjectContext';
import { ErrorBoundary } from './components/global/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </ErrorBoundary>
);
