import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    useTheme,
    InputAdornment,
    IconButton,
    Divider,
    Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyIcon from '@mui/icons-material/Key';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { useAppDispatch, useAppSelector } from '../store';
import { setApiProvider, setApiKey, setTheme } from '../store/slices/settingsSlice';

const SettingsPage: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const settings = useAppSelector((state) => state.settings);

    const [showApiKey, setShowApiKey] = useState(false);
    const [tempApiKey, setTempApiKey] = useState(settings.apiKey);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const handleSaveApiKey = () => {
        dispatch(setApiKey(tempApiKey));
        setSnackbar({ open: true, message: 'API key đã được lưu!', severity: 'success' });
    };

    const handleProviderChange = (provider: 'openai' | 'gemini') => {
        dispatch(setApiProvider(provider));
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Cài đặt
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Cấu hình API key và tùy chỉnh ứng dụng
                </Typography>
            </Box>

            {/* API Configuration */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                            }}
                        >
                            <SmartToyIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={600}>
                                Cấu hình AI
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Chọn nhà cung cấp AI và nhập API key
                            </Typography>
                        </Box>
                        {settings.apiKey && (
                            <Chip
                                icon={<CheckCircleIcon />}
                                label="Đã cấu hình"
                                color="success"
                                size="small"
                                sx={{ ml: 'auto' }}
                            />
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Provider Selection */}
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Nhà cung cấp AI</InputLabel>
                        <Select
                            value={settings.apiProvider}
                            label="Nhà cung cấp AI"
                            onChange={(e) => handleProviderChange(e.target.value as 'openai' | 'gemini')}
                        >
                            <MenuItem value="gemini">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        component="span"
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 1,
                                            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc04 100%)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        G
                                    </Box>
                                    Google Gemini (Khuyên dùng - Có tier miễn phí)
                                </Box>
                            </MenuItem>
                            <MenuItem value="openai">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        component="span"
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 1,
                                            background: '#10a37f',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                        }}
                                    >
                                        O
                                    </Box>
                                    OpenAI GPT-4o-mini
                                </Box>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/* API Key Input */}
                    <TextField
                        fullWidth
                        label="API Key"
                        type={showApiKey ? 'text' : 'password'}
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        placeholder={settings.apiProvider === 'gemini' ? 'AIza...' : 'sk-...'}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <KeyIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end">
                                        {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />

                    {/* Instructions */}
                    <Alert severity="info" sx={{ mb: 3 }}>
                        {settings.apiProvider === 'gemini' ? (
                            <>
                                Lấy API key miễn phí tại{' '}
                                <a
                                    href="https://aistudio.google.com/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: theme.palette.primary.main }}
                                >
                                    Google AI Studio
                                </a>
                            </>
                        ) : (
                            <>
                                Lấy API key tại{' '}
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: theme.palette.primary.main }}
                                >
                                    OpenAI Platform
                                </a>
                            </>
                        )}
                    </Alert>

                    <Button
                        variant="contained"
                        onClick={handleSaveApiKey}
                        disabled={!tempApiKey}
                        sx={{ minWidth: 150 }}
                    >
                        Lưu cài đặt
                    </Button>
                </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Giao diện
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            variant={settings.theme === 'light' ? 'contained' : 'outlined'}
                            onClick={() => dispatch(setTheme('light'))}
                            sx={{ flex: 1 }}
                        >
                            ☀️ Sáng
                        </Button>
                        <Button
                            variant={settings.theme === 'dark' ? 'contained' : 'outlined'}
                            onClick={() => dispatch(setTheme('dark'))}
                            sx={{ flex: 1 }}
                        >
                            🌙 Tối
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SettingsPage;
