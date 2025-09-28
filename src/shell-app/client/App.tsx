import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
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
        <Routes>
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
