// src/theme/index.js
import { createTheme } from '@mui/material/styles';

const elderCareTheme = createTheme({
  palette: {
    primary: {
      main: '#2A5C82', // Deep professional blue
      light: '#5A8CAD',
      dark: '#1A3C55',
    },
    secondary: {
      main: '#83B4C0', // Soothing teal
      light: '#B4D4DD',
      dark: '#5A8A97',
    },
    error: {
      main: '#C62828', // Alert red
    },
    warning: {
      main: '#F9A825', // Warning amber
    },
    success: {
      main: '#2E7D32', // Success green
    },
    background: {
      default: '#F8F9FA', // Light background
      paper: '#FFFFFF', // Card backgrounds
    },
    text: {
      primary: '#263238', // Dark gray
      secondary: '#607D8B', // Medium gray
    },
    // Custom colors for specific use cases
    custom: {
      medication: '#6A1B9A', // Purple
      appointment: '#1565C0', // Blue
      activity: '#2E7D32', // Green
      emergency: '#C62828', // Red
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none', // Disable auto uppercase
      fontWeight: 600,
    },
  },
  spacing: 8, // Base spacing unit (1 = 8px)
  shape: {
    borderRadius: 8, // Default border radius
  },
  components: {
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      variants: [
        {
          props: { variant: 'status' },
          style: {
            borderRadius: 4,
            borderWidth: 2,
            fontWeight: 500,
          },
        },
        {
          props: { variant: 'eventType' },
          style: ({ theme }) => ({
            borderColor: theme.palette.custom.medication,
            color: theme.palette.custom.medication,
          }),
        },
      ],
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.2s ease-in-out',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default elderCareTheme;
