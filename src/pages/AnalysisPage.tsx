import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,

    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    Alert,
    useTheme,
    Paper,
    Tabs,
    Tab,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningIcon from '@mui/icons-material/Warning';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FileUpload from '../components/common/FileUpload';
import RiskBadge from '../components/common/RiskBadge';
import ChatBox from '../components/common/ChatBox';
import { useAppDispatch, useAppSelector } from '../store';
import { addContract, setLoading, setError } from '../store/slices/contractSlice';
import { extractTextFromFile } from '../services/pdfService';
import { aiService } from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';
import { fileToBase64 } from '../utils/fileUtils';
import { createSession, addMessage, setActiveChat } from '../store/slices/chatSlice';
import type { Contract, ContractAnalysis, ContractCategory, ChatSession, ChatMessage } from '../types';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const AnalysisPage: React.FC = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.contracts);
    const settings = useAppSelector((state) => state.settings);
    const sessions = useAppSelector((state) => state.chat.sessions);

    const [currentContract, setCurrentContract] = useState<Contract | null>(null);
    const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
    const [tabValue, setTabValue] = useState(0);

    // Safety fix: Ensure body scroll is not locked
    useEffect(() => {
        document.body.style.overflow = 'unset';
    }, []);
    const [extractedText, setExtractedText] = useState<string>('');
    const [chatLoading, setChatLoading] = useState(false);

    // Get current chat session for the contract being analyzed
    const currentSession = sessions.find(s => s.contractId === currentContract?.id);

    useEffect(() => {
        aiService.setConfig({
            provider: settings.apiProvider,
            apiKey: settings.apiKey,
        });
    }, [settings.apiProvider, settings.apiKey]);

    // Update active chat when contract changes or session is created
    useEffect(() => {
        if (currentSession) {
            dispatch(setActiveChat(currentSession.id));
        } else {
            dispatch(setActiveChat(null));
        }
    }, [currentContract, currentSession, dispatch]);

    const handleFileSelect = async (file: File) => {
        if (!settings.apiKey) {
            dispatch(setError('Vui lòng cấu hình API key trong phần Cài đặt'));
            return;
        }

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            // Extract text from file
            const [text, base64] = await Promise.all([
                extractTextFromFile(file, settings.apiKey, settings.apiProvider),
                fileToBase64(file)
            ]);
            setExtractedText(text);

            // Create contract object
            const contract: Contract = {
                id: uuidv4(),
                name: file.name,
                content: text,
                uploadedAt: new Date().toISOString(),
                category: 'other' as ContractCategory,
                status: 'pending',
                tags: [],
                fileSize: file.size,
                fileData: base64,
            };

            // Analyze with AI
            const analysisResult = await aiService.analyzeContract(text);

            // Auto-categorize
            const categoryResult = await aiService.categorizeContract(text);
            contract.category = categoryResult.category as ContractCategory;

            // Update state
            contract.analysis = analysisResult;
            dispatch(addContract(contract));
            setCurrentContract(contract);
            setAnalysis(analysisResult);

        } catch (err) {
            dispatch(setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSendMessage = async (content: string) => {
        if (!currentContract?.id || !extractedText) return;

        let sessionId = currentSession?.id;
        let baseMessages = currentSession?.messages || [];

        // 1. Create session if it doesn't exist
        if (!sessionId) {
            const welcomeMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Xin chào! Tôi đã phân tích xong hợp đồng này. Bạn có thể đặt câu hỏi về các điều khoản, rủi ro hoặc tóm tắt nội dung.',
                timestamp: new Date().toISOString(),
            };
            const newSession: ChatSession = {
                id: crypto.randomUUID(),
                contractId: currentContract.id,
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

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Phân tích & Tóm tắt Hợp đồng
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Upload hợp đồng để AI phân tích, tóm tắt nội dung và phát hiện các điều khoản quan trọng
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Upload Section */}
                <Grid size={{ xs: 12, lg: 5 }}>
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

                            {loading && (
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <CircularProgress size={32} />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Đang phân tích hợp đồng với AI...
                                    </Typography>
                                </Box>
                            )}

                            {/* Extracted Text Preview */}
                            {extractedText && !loading && (
                                <Paper
                                    sx={{
                                        mt: 3,
                                        p: 2,
                                        maxHeight: 300,
                                        overflow: 'auto',
                                        background: theme.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.03)'
                                            : 'rgba(0,0,0,0.02)',
                                    }}
                                >
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                        Nội dung trích xuất ({extractedText.length} ký tự)
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                        }}
                                    >
                                        {extractedText.slice(0, 2000)}
                                        {extractedText.length > 2000 && '...'}
                                    </Typography>
                                </Paper>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Analysis Results */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    {analysis ? (
                        <Card>
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
                                        <AutoAwesomeIcon />
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600}>
                                            Kết quả phân tích
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {currentContract?.name}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={<CheckCircleIcon />}
                                        label="Hoàn thành"
                                        color="success"
                                        size="small"
                                        sx={{ ml: 'auto' }}
                                    />
                                </Box>

                                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tab label="Tóm tắt" />
                                    <Tab label="Điều khoản" />
                                    <Tab label="Ngày quan trọng" />
                                    <Tab label="Nghĩa vụ" />
                                    <Tab label={`Rủi ro (${analysis.risks.length})`} />
                                    <Tab label="💬 Hỏi đáp AI" />
                                </Tabs>

                                {/* Summary Tab */}
                                <TabPanel value={tabValue} index={0}>
                                    <Paper
                                        sx={{
                                            p: 3,
                                            background: theme.palette.mode === 'dark'
                                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                                                : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                            border: `1px solid ${theme.palette.primary.main}20`,
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                                            {analysis.summary}
                                        </Typography>
                                    </Paper>
                                </TabPanel>

                                {/* Key Terms Tab */}
                                <TabPanel value={tabValue} index={1}>
                                    {analysis.keyTerms.length > 0 ? (
                                        <List>
                                            {analysis.keyTerms.map((term, index) => (
                                                <React.Fragment key={index}>
                                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                        <ListItemIcon>
                                                            <DescriptionIcon color="primary" />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Typography fontWeight={600}>{term.term}</Typography>
                                                                    <Chip label={term.section} size="small" variant="outlined" />
                                                                </Box>
                                                            }
                                                            secondary={term.definition}
                                                        />
                                                    </ListItem>
                                                    {index < analysis.keyTerms.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">Không tìm thấy điều khoản đặc biệt</Typography>
                                    )}
                                </TabPanel>

                                {/* Important Dates Tab */}
                                <TabPanel value={tabValue} index={2}>
                                    {analysis.importantDates.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {analysis.importantDates.map((date, index) => (
                                                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                                    <Paper sx={{ p: 2 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <CalendarTodayIcon color="primary" fontSize="small" />
                                                            <Typography fontWeight={600}>{date.date}</Typography>
                                                        </Box>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {date.description}
                                                        </Typography>
                                                        <Chip
                                                            label={date.type}
                                                            size="small"
                                                            sx={{ mt: 1 }}
                                                        />
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Typography color="text.secondary">Không tìm thấy ngày quan trọng</Typography>
                                    )}
                                </TabPanel>

                                {/* Obligations Tab */}
                                <TabPanel value={tabValue} index={3}>
                                    {analysis.obligations.length > 0 ? (
                                        <List>
                                            {analysis.obligations.map((obligation, index) => (
                                                <React.Fragment key={index}>
                                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                        <ListItemIcon>
                                                            <AssignmentIcon color="primary" />
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                    <Chip
                                                                        label={obligation.party}
                                                                        size="small"
                                                                        color="primary"
                                                                        variant="outlined"
                                                                    />
                                                                    <Chip
                                                                        label={obligation.priority}
                                                                        size="small"
                                                                        color={
                                                                            obligation.priority === 'high'
                                                                                ? 'error'
                                                                                : obligation.priority === 'medium'
                                                                                    ? 'warning'
                                                                                    : 'default'
                                                                        }
                                                                    />
                                                                </Box>
                                                            }
                                                            secondary={obligation.description}
                                                        />
                                                    </ListItem>
                                                    {index < analysis.obligations.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography color="text.secondary">Không tìm thấy nghĩa vụ các bên</Typography>
                                    )}
                                </TabPanel>

                                {/* Risks Tab */}
                                <TabPanel value={tabValue} index={4}>
                                    {analysis.risks.length > 0 ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {analysis.risks.map((risk, index) => (
                                                <Accordion key={index} defaultExpanded={index === 0}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
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
                                                        <Typography variant="body2" paragraph>
                                                            {risk.description}
                                                        </Typography>
                                                        {risk.quote && (
                                                            <Paper
                                                                sx={{
                                                                    p: 2,
                                                                    my: 2,
                                                                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                                                                    background: theme.palette.mode === 'dark'
                                                                        ? 'rgba(255, 167, 38, 0.05)'
                                                                        : 'rgba(255, 167, 38, 0.05)',
                                                                    fontStyle: 'italic',
                                                                    color: 'text.secondary',
                                                                }}
                                                            >
                                                                <Typography variant="body2" fontWeight={500} gutterBottom>
                                                                    Original Text:
                                                                </Typography>
                                                                "{risk.quote}"
                                                            </Paper>
                                                        )}
                                                        <Paper
                                                            sx={{
                                                                p: 2,
                                                                background: theme.palette.mode === 'dark'
                                                                    ? 'rgba(76, 175, 80, 0.1)'
                                                                    : 'rgba(76, 175, 80, 0.05)',
                                                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                                            }}
                                                        >
                                                            <Typography variant="subtitle2" color="success.main" gutterBottom>
                                                                💡 Đề xuất xử lý:
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                {risk.suggestion}
                                                            </Typography>
                                                        </Paper>
                                                        <Chip
                                                            label={risk.section}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mt: 2 }}
                                                        />

                                                        {/* Scenarios */}
                                                        {risk.scenarios && risk.scenarios.length > 0 && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                                    🎭 Kịch bản thực tế:
                                                                </Typography>
                                                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                                    {risk.scenarios.map((scenario, idx) => (
                                                                        <Typography component="li" variant="body2" key={idx}>
                                                                            {scenario}
                                                                        </Typography>
                                                                    ))}
                                                                </Box>
                                                            </Box>
                                                        )}

                                                        {/* Legal References */}
                                                        {risk.legalReferences && risk.legalReferences.length > 0 && (
                                                            <Box sx={{ mt: 2 }}>
                                                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                                    ⚖️ Căn cứ pháp lý:
                                                                </Typography>
                                                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                                    {risk.legalReferences.map((ref, idx) => (
                                                                        <li key={idx}>
                                                                            <Typography
                                                                                component="a"
                                                                                href={ref.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                variant="body2"
                                                                                color="primary"
                                                                                sx={{
                                                                                    textDecoration: 'none',
                                                                                    '&:hover': { textDecoration: 'underline' }
                                                                                }}
                                                                            >
                                                                                {ref.title}
                                                                            </Typography>
                                                                        </li>
                                                                    ))}
                                                                </Box>
                                                            </Box>
                                                        )}
                                                    </AccordionDetails>
                                                </Accordion>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Alert severity="success">
                                            Không phát hiện rủi ro đáng kể trong hợp đồng này
                                        </Alert>
                                    )}
                                </TabPanel>

                                {/* Chat Tab */}
                                <TabPanel value={tabValue} index={5}>
                                    <ChatBox
                                        messages={currentSession?.messages || []}
                                        onSendMessage={handleSendMessage}
                                        loading={chatLoading}
                                    />
                                </TabPanel>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 400,
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 2,
                                    }}
                                >
                                    <AutoAwesomeIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                                </Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Chờ phân tích
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Tải lên hợp đồng để bắt đầu phân tích với AI
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalysisPage;
