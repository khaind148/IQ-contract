import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import ChatBox from '../components/common/ChatBox';
import ContractDetailView from '../components/common/ContractDetailView';
import { aiService } from '../services/aiService';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { createSession, addMessage, setActiveChat } from '../store/slices/chatSlice';
import type { ChatSession, ChatMessage } from '../types';

const ChatPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const contracts = useAppSelector((state) => state.contracts.contracts);
    const sessions = useAppSelector((state) => state.chat.sessions);
    const [loading, setLoading] = useState(false);

    // Safety fix: Ensure body scroll is not locked
    useEffect(() => {
        document.body.style.overflow = 'unset';
    }, []);

    // Single source of truth: URL param
    const selectedContractId = searchParams.get('contractId') || '';
    const selectedContract = contracts.find(c => c.id === selectedContractId);
    const currentSession = sessions.find(s => s.contractId === selectedContractId);

    const handleContractChange = (id: string) => {
        if (id) {
            setSearchParams({ contractId: id }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    };

    // Auto-initialize session if it doesn't exist
    useEffect(() => {
        if (selectedContractId && !currentSession && selectedContract) {
            const welcomeMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Xin chào! Tôi là trợ lý AI. Tôi đã sẵn sàng hỗ trợ bạn phân tích hợp đồng "${selectedContract.name}". Bạn có thắc mắc gì về các điều khoản, rủi ro hay nghĩa vụ trong văn bản này không?`,
                timestamp: new Date().toISOString(),
            };
            const newSession: ChatSession = {
                id: crypto.randomUUID(),
                contractId: selectedContractId,
                messages: [welcomeMsg],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            dispatch(createSession(newSession));
        }
    }, [selectedContractId, currentSession, selectedContract, dispatch]);

    // Set active chat when session changes or contract is selected
    useEffect(() => {
        if (currentSession) {
            dispatch(setActiveChat(currentSession.id));
        } else {
            dispatch(setActiveChat(null));
        }
    }, [selectedContractId, currentSession, dispatch]);

    const handleSendMessage = async (content: string) => {
        if (!selectedContract?.content) return;

        let sessionId = currentSession?.id;
        let baseMessages = currentSession?.messages || [];

        // 1. Create session if it doesn't exist
        if (!sessionId) {
            const welcomeMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: 'Xin chào! Tôi là trợ lý AI. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về hợp đồng này.',
                timestamp: new Date().toISOString(),
            };
            const newSession: ChatSession = {
                id: crypto.randomUUID(),
                contractId: selectedContractId,
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

        setLoading(true);
        try {
            // 3. Build history
            const history = [...baseMessages, userMsg].map(m =>
                `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
            );

            // 4. Call AI service
            const response = await aiService.chatWithContract(selectedContract.content, content, history);

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
            setLoading(false);
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Hỏi đáp AI thông minh
                </Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Chọn hợp đồng để hỏi đáp</InputLabel>
                            <Select
                                value={selectedContractId}
                                label="Chọn hợp đồng để hỏi đáp"
                                onChange={(e) => handleContractChange(e.target.value)}
                                sx={{ bgcolor: 'background.paper' }}
                            >
                                {contracts.length === 0 ? (
                                    <MenuItem disabled>Chưa có hợp đồng nào được tải lên</MenuItem>
                                ) : (
                                    contracts.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            {!selectedContract ? (
                <Card sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', border: '1px dashed #ccc' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Box sx={{ mb: 2 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                        </Box>
                        <Typography color="text.secondary">
                            {contracts.length === 0
                                ? 'Vui lòng tải lên hợp đồng trong mục Phân tích hoặc Kiểm tra rủi ro trước'
                                : 'Vui lòng chọn một hợp đồng để bắt đầu'}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    {/* Left Pane: Details */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%', overflow: 'auto' }}>
                        <Paper variant="outlined" sx={{ p: 3, height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
                                Thông tin hợp đồng
                            </Typography>
                            <ContractDetailView contract={selectedContract} showOriginalContent={true} />
                        </Paper>
                    </Grid>

                    {/* Right Pane: Chat */}
                    <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                        <ChatBox
                            messages={currentSession?.messages || []}
                            onSendMessage={handleSendMessage}
                            loading={loading}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default ChatPage;
