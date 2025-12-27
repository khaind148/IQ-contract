import React from 'react';
import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    useTheme,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CompareIcon from '@mui/icons-material/Compare';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import SettingsIcon from '@mui/icons-material/Settings';

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
    drawerWidth: number;
}

const menuItems = [
    { text: 'Tổng quan', icon: <DashboardIcon />, path: '/' },
    { text: 'Phân tích hợp đồng', icon: <AnalyticsIcon />, path: '/analysis' },
    // { text: 'So sánh hợp đồng', icon: <CompareIcon />, path: '/compare' },
    { text: 'Hỏi đáp AI', icon: <ChatIcon />, path: '/chat' },
    { text: 'Quản lý hợp đồng', icon: <FolderIcon />, path: '/management' },
    // { text: 'So sánh thực tế', icon: <FactCheckIcon />, path: '/reality' },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, drawerWidth }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)'
                    : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        width: 45,
                        height: 45,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{ color: 'white', fontWeight: 700 }}
                    >
                        IQ
                    </Typography>
                </Box>
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        ContractIQ
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        AI Contract Analysis
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2 }} />

            {/* Menu Items */}
            <List sx={{ px: 2, py: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    onClose();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.5,
                                    background: isActive
                                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                                        : 'transparent',
                                    border: isActive
                                        ? `1px solid ${theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)'}`
                                        : '1px solid transparent',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Divider sx={{ mx: 2 }} />

            {/* Settings */}
            <List sx={{ px: 2, py: 2 }}>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => {
                            navigate('/settings');
                            onClose();
                        }}
                        sx={{
                            borderRadius: 2,
                            py: 1.5,
                            background: location.pathname === '/settings'
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                                : 'transparent',
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <SettingsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Cài đặt" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        borderRight: 'none',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
