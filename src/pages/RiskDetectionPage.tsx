import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    useTheme,
    Paper,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning';
import ShieldIcon from '@mui/icons-material/Shield';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileUpload from '../components/common/FileUpload';
import RiskBadge from '../components/common/RiskBadge';
import ChatBox from '../components/common/ChatBox';
import { useAppDispatch, useAppSelector } from '../store';
import { addContract, setLoading, setError } from '../store/slices/contractSlice';
import { extractTextFromFile } from '../services/pdfService';
import { aiService } from '../services/aiService';
import { fileToBase64 } from '../utils/fileUtils';
import { createSession, addMessage, setActiveChat } from '../store/slices/chatSlice';
import type { RiskItem, ChatSession, ChatMessage, Contract, ContractCategory } from '../types';

const RiskDetectionPage: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.contracts);
    const settings = useAppSelector((state) => state.settings);
    const sessions = useAppSelector((state) => state.chat.sessions);

    const [fileName, setFileName] = useState<string>('');
    const [risks, setRisks] = useState<RiskItem[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [extractedText, setExtractedText] = useState<string>('');
    const [chatLoading, setChatLoading] = useState(false);

    // Track the current contract ID (since we don't have a full contract object here, we use a temporary one or the one we just processed)
    // For RiskDetectionPage, it seems it doesn't save to Redux contracts? 
    // Wait, let's check if it should. 
    // ChatPage depends on contractId. If we don't have a contractId, we can't save history properly.
    // Let's see how RiskDetectionPage handles files.

    useEffect(() => {
        aiService.setConfig({
            provider: settings.apiProvider,
            apiKey: settings.apiKey,
        });
    }, [settings.apiProvider, settings.apiKey]);

    // RiskDetectionPage currently doesn't seem to have a contractId in its local state.
    // I should probably generate a temporary one or just use the filename as a pseudo-ID if we want persistence.
    // Actually, looking at handleFileSelect, it doesn't dispatch addContract.
    // This looks like a bug in the original code, or intended "volatile" analysis.
    // However, to fix ChatBox, I need SOME ID.

    const [tempContractId, setTempContractId] = useState<string>(crypto.randomUUID());

    const currentSession = sessions.find(s => s.contractId === tempContractId);

    useEffect(() => {
        if (currentSession) {
            dispatch(setActiveChat(currentSession.id));
        } else {
            dispatch(setActiveChat(null));
        }
    }, [tempContractId, currentSession, dispatch]);

    const handleFileSelect = async (file: File) => {
        if (!settings.apiKey) {
            dispatch(setError('Vui lòng cấu hình API key trong phần Cài đặt'));
            return;
        }

        dispatch(setLoading(true));
        dispatch(setError(null));
        setAnalyzing(true);
        setFileName(file.name);
        setRisks([]);
        setTempContractId(crypto.randomUUID()); // Reset ID for new file

        try {
            // Extract text and convert file
            const [text, base64] = await Promise.all([
                extractTextFromFile(file, settings.apiKey, settings.apiProvider),
                fileToBase64(file)
            ]);
            setExtractedText(text);

            // Detect risks with AI
            const detectedRisks = await aiService.detectRisks(text);
            setRisks(detectedRisks);

            // Save to Redux for persistence
            const contract: Contract = {
                id: tempContractId,
                name: file.name,
                content: text,
                uploadedAt: new Date().toISOString(),
                category: 'other' as ContractCategory,
                status: 'pending',
                tags: [],
                fileSize: file.size,
                fileData: base64,
                analysis: {
                    summary: `Phân tích rủi ro cho hợp đồng ${file.name}`,
                    keyTerms: [],
                    importantDates: [],
                    obligations: [],
                    risks: detectedRisks,
                    analyzedAt: new Date().toISOString(),
                }
            };
            dispatch(addContract(contract));

        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích'));
        } finally {
            dispatch(setLoading(false));
            setAnalyzing(false);
        }
    };

    const handleSendMessage = async (content: string) => {
        if (!tempContractId || !extractedText) return;

        let sessionId = currentSession?.id;
        let baseMessages = currentSession?.messages || [];

        // 1. Create session if it doesn't exist
        if (!sessionId) {
            const welcomeMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Xin chào! Tôi đã phát hiện các rủi ro trong hợp đồng này. Bạn có thể hỏi tôi chi tiết về từng rủi ro hoặc cách khắc phục.',
                timestamp: new Date().toISOString(),
            };
            const newSession: ChatSession = {
                id: crypto.randomUUID(),
                contractId: tempContractId,
                messages: [welcomeMsg],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            dispatch(createSession(newSession));
            sessionId = newSession.id;
            baseMessages = [welcomeMsg];
        }

        // 2. Add user message
        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content,
            timestamp: new Date().toISOString(),
        };
        dispatch(addMessage({ sessionId, message: userMsg }));

        setChatLoading(true);
        try {
            // 3. Build history
            const history = [...baseMessages, userMsg].map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
            );

            // 4. Call AI service
            const response = await aiService.chatWithContract(extractedText, content, history);

            // 5. Add assistant message
            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: response.answer,
                citations: response.citations,
                timestamp: new Date().toISOString(),
            };
            dispatch(addMessage({ sessionId, message: assistantMsg }));
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Xin lỗi, đã có lỗi xảy ra: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date().toISOString(),
            };
            dispatch(addMessage({ sessionId, message: errorMsg }));
        } finally {
            setChatLoading(false);
        }
    };

    const getRiskStats = () => {
        const stats = {
            critical: risks.filter(r => r.severity === 'critical').length,
            high: risks.filter(r => r.severity === 'high').length,
            medium: risks.filter(r => r.severity === 'medium').length,
            low: risks.filter(r => r.severity === 'low').length,
        };
        return stats;
    };

    const stats = getRiskStats();

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        <ShieldIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>
                            Phát hiện Rủi ro Hợp đồng
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            AI phân tích chuyên sâu để phát hiện các rủi ro pháp lý tiềm ẩn trong hợp đồng
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Upload Section */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Tải lên hợp đồng
                            </Typography>

                            <FileUpload
                                onFileSelect={handleFileSelect}
                                loading={loading}
                                label="Chọn file hợp đồng"
                                description="Hỗ trợ PDF, TXT, PNG, JPG, JPEG, DOC, DOCX (Tối đa 10MB)"
                            />

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {analyzing && (
                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <CircularProgress size={20} />
                                        <Typography variant="body2" color="text.secondary">
                                            Đang phân tích rủi ro với AI...
                                        </Typography>
                                    </Box>
                                    <LinearProgress />
                                </Box>
                            )}

                            {/* Info Box */}
                            <Paper
                                sx={{
                                    mt: 3,
                                    p: 2,
                                    background: theme.palette.mode === 'dark'
                                        ? 'rgba(33, 150, 243, 0.1)'
                                        : 'rgba(33, 150, 243, 0.05)',
                                    border: '1px solid rgba(33, 150, 243, 0.3)',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    AI sẽ phát hiện:
                                </Typography>
                                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                        Điều khoản bất lợi
                                    </Typography>
                                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                        Phạt vi phạm quá cao
                                    </Typography>
                                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                        Chi phí ẩn
                                    </Typography>
                                    <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                                        Điều khoản mơ hồ
                                    </Typography>
                                    <Typography component="li" variant="body2">
                                        Vi phạm pháp luật
                                    </Typography>
                                </Box>
                            </Paper>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Results Section */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    {risks.length > 0 ? (
                        <Box>
                            {/* Stats Cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Card
                                        sx={{
                                            background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                                            color: 'white',
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h3" fontWeight={700}>
                                                {stats.critical}
                                            </Typography>
                                            <Typography variant="body2">Nghiêm trọng</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Card
                                        sx={{
                                            background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                                            color: 'white',
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h3" fontWeight={700}>
                                                {stats.high}
                                            </Typography>
                                            <Typography variant="body2">Cao</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Card
                                        sx={{
                                            background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                                            color: 'white',
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h3" fontWeight={700}>
                                                {stats.medium}
                                            </Typography>
                                            <Typography variant="body2">Trung bình</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Card
                                        sx={{
                                            background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                                            color: 'white',
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Typography variant="h3" fontWeight={700}>
                                                {stats.low}
                                            </Typography>
                                            <Typography variant="body2">Thấp</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Risk List */}
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={600}>
                                                Danh sách Rủi ro phát hiện
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {fileName} • {risks.length} rủi ro
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={<CheckCircleIcon />}
                                            label="Phân tích hoàn tất"
                                            color="success"
                                            size="small"
                                        />
                                    </Box>

                                    <Divider sx={{ mb: 2 }} />

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {risks.map((risk, index) => (
                                            <Accordion key={risk.id} defaultExpanded={index === 0}>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{
                                                        '&:hover': {
                                                            background: theme.palette.mode === 'dark'
                                                                ? 'rgba(255,255,255,0.05)'
                                                                : 'rgba(0,0,0,0.02)',
                                                        },
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                                                        <WarningIcon
                                                            color={
                                                                risk.severity === 'critical' || risk.severity === 'high'
                                                                    ? 'error'
                                                                    : risk.severity === 'medium'
                                                                        ? 'warning'
                                                                        : 'action'
                                                            }
                                                        />
                                                        <Typography fontWeight={600} sx={{ flexGrow: 1 }}>
                                                            {risk.title}
                                                        </Typography>
                                                        <RiskBadge severity={risk.severity} />
                                                    </Box>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        {/* Description */}
                                                        <Box>
                                                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                                📋 Mô tả chi tiết:
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {risk.description}
                                                            </Typography>
                                                        </Box>

                                                        {/* Suggestion */}
                                                        <Paper
                                                            sx={{
                                                                p: 2,
                                                                background: theme.palette.mode === 'dark'
                                                                    ? 'rgba(76, 175, 80, 0.1)'
                                                                    : 'rgba(76, 175, 80, 0.05)',
                                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                                <LightbulbIcon color="success" fontSize="small" />
                                                                <Typography variant="subtitle2" color="success.main" fontWeight={600}>
                                                                    Đề xuất xử lý:
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="body2">
                                                                {risk.suggestion}
                                                            </Typography>
                                                        </Paper>

                                                        {/* Meta info */}
                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                            <Chip
                                                                icon={<DescriptionIcon />}
                                                                label={risk.section}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                label={risk.category}
                                                                size="small"
                                                                color="primary"
                                                                variant="outlined"
                                                            />
                                                        </Box>
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </Box>

                                    {/* AI Q&A Section */}
                                    <Box sx={{ mt: 4 }}>
                                        <ChatBox
                                            messages={currentSession?.messages || []}
                                            onSendMessage={handleSendMessage}
                                            loading={chatLoading}
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    ) : (
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 500,
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                    }}
                                >
                                    <ShieldIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                                </Box>
                                <Typography variant="h5" fontWeight={600} gutterBottom>
                                    Sẵn sàng phân tích
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                    Tải lên hợp đồng để AI phát hiện các rủi ro pháp lý tiềm ẩn
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 400, mx: 'auto' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleIcon color="success" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            Phân tích chuyên sâu với AI
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleIcon color="success" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            Phát hiện 7+ loại rủi ro khác nhau
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleIcon color="success" fontSize="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            Đề xuất giải pháp xử lý cụ thể
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default RiskDetectionPage;
