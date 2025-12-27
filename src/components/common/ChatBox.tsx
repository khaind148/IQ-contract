import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    CircularProgress,
    Avatar,
    useTheme,
    Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import type { ChatMessage } from '../../types';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    loading?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, loading = false }) => {
    const theme = useTheme();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || loading) return;
        onSendMessage(input);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Paper
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToyIcon />
                    <Typography variant="h6" fontWeight={600}>
                        Hỏi đáp AI về Hợp đồng
                    </Typography>
                </Box>
                <Typography variant="caption">
                    Đặt câu hỏi về nội dung, điều khoản, hoặc bất kỳ thắc mắc nào
                </Typography>
            </Box>

            {/* Messages */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    background: theme.palette.mode === 'dark'
                        ? 'rgba(0,0,0,0.2)'
                        : 'rgba(0,0,0,0.02)',
                }}
            >
                {messages.length === 0 && !loading && (
                    <Box sx={{ textAlign: 'center', mt: 4, color: 'text.disabled' }}>
                        <Typography variant="body2">
                            Chưa có tin nhắn nào. Hãy bắt đầu bằng cách đặt câu hỏi.
                        </Typography>
                    </Box>
                )}
                {messages.map((message) => (
                    <Box
                        key={message.id}
                        sx={{
                            display: 'flex',
                            gap: 1,
                            alignItems: 'flex-start',
                            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                        }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: message.role === 'user'
                                    ? theme.palette.primary.main
                                    : theme.palette.secondary.main,
                                width: 32,
                                height: 32,
                            }}
                        >
                            {message.role === 'user' ? (
                                <PersonIcon fontSize="small" />
                            ) : (
                                <SmartToyIcon fontSize="small" />
                            )}
                        </Avatar>
                        <Box sx={{ maxWidth: '75%' }}>
                            <Paper
                                sx={{
                                    p: 1.5,
                                    background: message.role === 'user'
                                        ? theme.palette.primary.main
                                        : theme.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.1)'
                                            : 'white',
                                    color: message.role === 'user' ? 'white' : 'inherit',
                                }}
                            >
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {message.content}
                                </Typography>
                            </Paper>
                            {message.citations && message.citations.length > 0 && (
                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {message.citations.map((citation, i) => (
                                        <Chip
                                            key={i}
                                            label={`📌 ${citation.slice(0, 50)}...`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}
                {loading && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                bgcolor: theme.palette.secondary.main,
                                width: 32,
                                height: 32,
                            }}
                        >
                            <SmartToyIcon fontSize="small" />
                        </Avatar>
                        <Paper sx={{ p: 1.5 }}>
                            <CircularProgress size={20} />
                        </Paper>
                    </Box>
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        placeholder="Đặt câu hỏi về hợp đồng..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        size="small"
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        sx={{
                            background: theme.palette.primary.main,
                            color: 'white',
                            '&:hover': {
                                background: theme.palette.primary.dark,
                            },
                            '&:disabled': {
                                background: theme.palette.action.disabledBackground,
                            },
                        }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default ChatBox;
