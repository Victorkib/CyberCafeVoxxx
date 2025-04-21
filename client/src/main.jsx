import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/index.js';
import { NotificationProvider } from './contexts/NotificationContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </LocalizationProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
