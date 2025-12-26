import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

const baseTheme: ThemeOptions = {
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h5: {
            fontWeight: 500,
            fontSize: '1.1rem',
        },
        h6: {
            fontWeight: 500,
            fontSize: '1rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRadius: 0,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
};

export const lightTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        primary: {
            main: '#667eea',
            light: '#8e9ef5',
            dark: '#4a5fc7',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#764ba2',
            light: '#9c7bc4',
            dark: '#5c3a80',
            contrastText: '#ffffff',
        },
        error: {
            main: '#ef5350',
            light: '#ff867c',
            dark: '#b61827',
        },
        warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
        },
        success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
        },
        info: {
            main: '#00bcd4',
            light: '#5ddef4',
            dark: '#008ba3',
        },
        background: {
            default: '#f5f7fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a2e',
            secondary: '#666687',
        },
    },
});

export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: '#8e9ef5',
            light: '#b8c5ff',
            dark: '#667eea',
            contrastText: '#000000',
        },
        secondary: {
            main: '#9c7bc4',
            light: '#c9aae8',
            dark: '#764ba2',
            contrastText: '#000000',
        },
        error: {
            main: '#ff867c',
            light: '#ffb8b0',
            dark: '#ef5350',
        },
        warning: {
            main: '#ffb74d',
            light: '#ffe97d',
            dark: '#c88719',
        },
        success: {
            main: '#81c784',
            light: '#b2fab4',
            dark: '#519657',
        },
        info: {
            main: '#5ddef4',
            light: '#95ffff',
            dark: '#00acc1',
        },
        background: {
            default: '#0f0f1a',
            paper: '#1a1a2e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a0a0b0',
        },
    },
    components: {
        ...baseTheme.components,
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                },
            },
        },
    },
});
