import React from 'react';
import {
    AppBar,
    Toolbar,

    IconButton,
    Box,
    useTheme,
    Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { setTheme } from '../../store/slices/settingsSlice';

interface HeaderProps {
    onMenuClick: () => void;
    drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, drawerWidth }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentTheme = useAppSelector((state) => state.settings.theme);

    const handleThemeToggle = () => {
        dispatch(setTheme(currentTheme === 'dark' ? 'light' : 'dark'));
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
                background: theme.palette.mode === 'dark'
                    ? 'rgba(26, 26, 46, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${theme.palette.divider}`,
                boxShadow: 'none',
            }}
        >
            <Toolbar>
                <IconButton
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { sm: 'none' }, color: 'text.secondary' }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={currentTheme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
                        <IconButton onClick={handleThemeToggle} sx={{ color: 'text.secondary' }}>
                            {currentTheme === 'dark' ? <Brightness7Icon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Cài đặt">
                        <IconButton onClick={() => navigate('/settings')} sx={{ color: 'text.secondary' }}>
                            <SettingsIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
