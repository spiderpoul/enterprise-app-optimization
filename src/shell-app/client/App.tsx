import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './pages/Login';
import { ConfigProvider } from '@kaspersky/hexa-ui/design-system/context/provider';
import { GlobalStyle } from '@kaspersky/hexa-ui/design-system/global-style';
import { ThemeKey } from '@kaspersky/hexa-ui/design-system';
import { LangVariants } from '@kaspersky/hexa-ui/helpers/localization/types';
import { Notification } from '@kaspersky/hexa-ui';

const App: React.FC = () => {
  const [themeKey] = useState<ThemeKey>(ThemeKey.Light);

  return (
    <ConfigProvider theme={themeKey} locale={LangVariants.EnUs}>
      <GlobalStyle />
      <Notification />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
