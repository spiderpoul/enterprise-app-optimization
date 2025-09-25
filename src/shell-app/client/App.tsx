import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './components/MainLayout';

const App: React.FC = () => (
  <BrowserRouter>
    <MainLayout />
  </BrowserRouter>
);

export default App;
