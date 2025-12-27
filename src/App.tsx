import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store, useAppSelector } from './store';
import { lightTheme, darkTheme } from './theme';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import RiskDetectionPage from './pages/RiskDetectionPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

// Theme wrapper component
const ThemedApp: React.FC = () => {
  const themeMode = useAppSelector((state) => state.settings.theme);
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analysis" element={<AnalysisPage />} />
            <Route path="risks" element={<RiskDetectionPage />} />
            <Route path="compare" element={<ComingSoon title="So sánh hợp đồng" />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="management" element={<ComingSoon title="Quản lý hợp đồng" />} />
            <Route path="reality" element={<ComingSoon title="So sánh thực tế" />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

// Coming Soon placeholder for other pages
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <h2 style={{ marginBottom: '16px' }}>{title}</h2>
    <p style={{ color: '#888' }}>Tính năng đang được phát triển...</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
};

export default App;
