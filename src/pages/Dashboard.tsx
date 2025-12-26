import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import WarningIcon from '@mui/icons-material/Warning';
import FolderIcon from '@mui/icons-material/Folder';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppSelector } from '../store';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const contracts = useAppSelector((state) => state.contracts.contracts);
    const apiKey = useAppSelector((state) => state.settings.apiKey);

    const stats = [
        {
            title: 'Tổng hợp đồng',
            value: contracts.length,
            icon: <FolderIcon />,
            color: '#667eea',
            bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        {
            title: 'Đã phân tích',
            value: contracts.filter((c) => c.analysis).length,
            icon: <AnalyticsIcon />,
            color: '#00bcd4',
            bgGradient: 'linear-gradient(135deg, #00bcd4 0%, #2196f3 100%)',
        },
        {
            title: 'Có rủi ro',
            value: contracts.filter((c) => c.analysis?.risks && c.analysis.risks.length > 0).length,
            icon: <WarningIcon />,
            color: '#ff9800',
            bgGradient: 'linear-gradient(135deg, #ff9800 0%, #f44336 100%)',
        },
        {
            title: 'Hiệu quả',
            value: '95%',
            icon: <TrendingUpIcon />,
            color: '#4caf50',
            bgGradient: 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)',
        },
    ];

    return (
        <Box>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Xin chào! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Chào mừng bạn đến với ContractIQ - Nền tảng phân tích hợp đồng thông minh
                </Typography>
            </Box>

            {/* API Key Warning */}
            {!apiKey && (
                <Card
                    sx={{
                        mb: 3,
                        background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(244, 67, 54, 0.1) 100%)',
                        border: '1px solid rgba(255, 152, 0, 0.3)',
                    }}
                >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <WarningIcon sx={{ color: '#ff9800' }} />
                            <Box>
                                <Typography fontWeight={600}>Chưa cấu hình API Key</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Vui lòng thêm API key để sử dụng tính năng phân tích AI
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/settings')}
                            sx={{
                                background: 'linear-gradient(135deg, #ff9800 0%, #f44336 100%)',
                            }}
                        >
                            Cài đặt ngay
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
                        <Card
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                height: '100%',
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: stat.bgGradient,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: `0 4px 15px ${stat.color}40`,
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h3" fontWeight={700}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.title}
                                </Typography>
                            </CardContent>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: -20,
                                    bottom: -20,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: `${stat.color}10`,
                                }}
                            />
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Quick Actions */}
            <Typography variant="h5" fontWeight={600} gutterBottom>
                Bắt đầu nhanh
            </Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            },
                        }}
                        onClick={() => navigate('/analysis')}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <AnalyticsIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600}>
                                            Phân tích hợp đồng
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Upload và phân tích hợp đồng với AI
                                        </Typography>
                                    </Box>
                                </Box>
                                <ArrowForwardIcon color="action" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Card
                        sx={{
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            },
                        }}
                        onClick={() => navigate('/settings')}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 2,
                                            background: 'linear-gradient(135deg, #00bcd4 0%, #2196f3 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    >
                                        <TrendingUpIcon sx={{ fontSize: 28 }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600}>
                                            Cài đặt AI
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Cấu hình API key và tùy chỉnh
                                        </Typography>
                                    </Box>
                                </Box>
                                <ArrowForwardIcon color="action" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Contracts */}
            {contracts.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                        Hợp đồng gần đây
                    </Typography>
                    <Grid container spacing={2}>
                        {contracts.slice(0, 3).map((contract) => (
                            <Grid size={{ xs: 12 }} key={contract.id}>
                                <Card>
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <FolderIcon color="primary" />
                                            <Box>
                                                <Typography fontWeight={500}>{contract.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(contract.uploadedAt).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {contract.analysis ? (
                                                <Chip label="Đã phân tích" size="small" color="success" />
                                            ) : (
                                                <Chip label="Chưa phân tích" size="small" />
                                            )}
                                            {contract.analysis?.risks && contract.analysis.risks.length > 0 && (
                                                <Chip
                                                    label={`${contract.analysis.risks.length} rủi ro`}
                                                    size="small"
                                                    color="warning"
                                                />
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default Dashboard;
