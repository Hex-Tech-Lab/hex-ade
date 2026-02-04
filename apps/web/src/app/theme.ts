'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // Sky blue accent
      light: '#7dd3fc',
      dark: '#0284c7',
    },
    secondary: {
      main: '#818cf8', // Indigo accent
    },
    background: {
      default: '#020617', // Deep slate/ebony
      paper: '#0f172a',   // Navy slate surface
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#38bdf8',
    },
    divider: '#1e293b',
  },
  typography: {
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, fontSize: '0.9rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.8rem' },
    body1: { fontSize: '0.875rem' },
    body2: { fontSize: '0.8rem' },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.8rem',
    },
    caption: {
      fontSize: '0.75rem',
    },
  },
  shape: {
    borderRadius: 4, // Tighter corners for corporate look
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          color: '#f8fafc',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
        },
      },
    },
  },
});

export default theme;
