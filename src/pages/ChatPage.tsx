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
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../store';
import ChatBox from '../components/common/ChatBox';
import { aiService } from '../services/aiService';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { createSession, addMessage, setActiveChat } from '../store/slices/chatSlice';
import type { ChatSession, ChatMessage } from '../types';

const ChatPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const contracts = useAppSelector((state) => state.contracts.contracts);
    const sessions = useAppSelector((state) => state.chat.sessions);

    const [selectedContractId, setSelectedContractId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Find the current session for the selected contract
    const currentSession = sessions.find(s => s.contractId === selectedContractId);
    const selectedContract = contracts.find(c => c.id === selectedContractId);

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
            // 3. Build history (using baseMessages which is the state BEFORE user message was just dispatched)
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
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    Hỏi đáp AI thông minh
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Chọn một hợp đồng đã tải lên để bắt đầu trò chuyện và đặt câu hỏi chuyên sâu với AI
                </Typography>
            </Box>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <FormControl fullWidth size="small">
                        <InputLabel>Chọn hợp đồng để hỏi đáp</InputLabel>
                        <Select
                            value={selectedContractId}
                            label="Chọn hợp đồng để hỏi đáp"
                            onChange={(e) => setSelectedContractId(e.target.value)}
                        >
                            {contracts.length === 0 ? (
                                <MenuItem disabled>Chưa có hợp đồng nào được tải lên</MenuItem>
                            ) : (
                                contracts.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name} ({new Date(c.uploadedAt).toLocaleDateString()})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </CardContent>
            </Card>

            {selectedContract ? (
                <ChatBox
                    messages={currentSession?.messages || []}
                    onSendMessage={handleSendMessage}
                    loading={loading}
                />
            ) : (
                <Card sx={{ p: 4, textAlign: 'center', background: 'rgba(0,0,0,0.02)', border: '1px dashed #ccc' }}>
                    <Box sx={{ mb: 2 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    </Box>
                    <Typography color="text.secondary">
                        {contracts.length === 0
                            ? 'Vui lòng tải lên hợp đồng trong mục Phân tích hoặc Kiểm tra rủi ro trước'
                            : 'Vui lòng chọn một hợp đồng từ danh sách trên để bắt đầu'}
                    </Typography>
                </Card>
            )}
        </Box>
    );
};

export default ChatPage;
