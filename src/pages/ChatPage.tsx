import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import { useAppSelector } from '../store';
import ChatBox from '../components/common/ChatBox';
import { aiService } from '../services/aiService';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const ChatPage: React.FC = () => {
    const contracts = useAppSelector((state) => state.contracts.contracts);
    const [selectedContractId, setSelectedContractId] = useState<string>('');

    const selectedContract = contracts.find(c => c.id === selectedContractId);

    const handleChatMessage = async (question: string, history: string[]) => {
        if (!selectedContract?.content) {
            throw new Error('Vui lòng chọn hợp đồng để bắt đầu hỏi đáp');
        }
        return await aiService.chatWithContract(selectedContract.content, question, history);
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
                <ChatBox onSendMessage={handleChatMessage} />
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
