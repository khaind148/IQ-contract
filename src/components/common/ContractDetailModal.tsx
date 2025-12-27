import React from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Paper,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Stack,
    Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import DownloadIcon from '@mui/icons-material/Download';
import ContractDetailView from './ContractDetailView';
import type { Contract } from '../../types';
import { downloadBase64File } from '../../utils/fileUtils';

interface ContractDetailModalProps {
    open: boolean;
    onClose: () => void;
    contract: Contract | null;
}

const ContractDetailModal: React.FC<ContractDetailModalProps> = ({ open, onClose, contract }) => {
    const navigate = useNavigate();

    if (!contract) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                        Chi tiết Phân tích: {contract.name}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {!contract.analysis ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <AnalyticsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                        <Typography color="text.secondary">
                            Hợp đồng này chưa được phân tích. Hãy sử dụng tính năng "Phân tích hợp đồng" để bắt đầu.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Summary Section */}
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AutoAwesomeIcon fontSize="small" color="primary" />
                                Tóm tắt nội dung
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {contract.analysis.summary}
                                </Typography>
                            </Paper>
                        </Box>

                        {/* Risks Section */}
                        {contract.analysis.risks.length > 0 && (
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningIcon fontSize="small" color="warning" />
                                    Rủi ro phát hiện ({contract.analysis.risks.length})
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {contract.analysis.risks.map((risk, idx) => (
                                        <Accordion key={idx} variant="outlined">
                                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
                                                        <Chip
                                                            label={risk.severity.toUpperCase()}
                                                            color={
                                                                risk.severity === 'critical' || risk.severity === 'high'
                                                                    ? 'error'
                                                                    : risk.severity === 'medium'
                                                                        ? 'warning'
                                                                        : 'info'
                                                            }
                                                            size="small"
                                                        />
                                                        <Typography variant="body2" fontWeight={600}>{risk.title}</Typography>
                                                    </Stack>
                                                    <RiskBadge severity={risk.severity} />
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pt: 0 }}>
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {risk.description}
                                                </Typography>

                                                {/* Quote */}
                                                {risk.quote && (
                                                    <Paper
                                                        variant="outlined"
                                                        sx={{
                                                            p: 2,
                                                            mb: 2,
                                                            borderLeft: `4px solid #ed6c02`, // Warning color
                                                            bgcolor: 'action.hover',
                                                            fontStyle: 'italic',
                                                        }}
                                                    >
                                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                            Trích dẫn nguyên văn:
                                                        </Typography>
                                                        "{risk.quote}"
                                                    </Paper>
                                                )}

                                                {/* Scenarios */}
                                                {risk.scenarios && risk.scenarios.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                            🎭 Kịch bản thực tế:
                                                        </Typography>
                                                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                            {risk.scenarios.map((scenario, sIdx) => (
                                                                <Typography key={sIdx} component="li" variant="caption" color="text.secondary">
                                                                    {scenario}
                                                                </Typography>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                {/* Legal References */}
                                                {risk.legalReferences && risk.legalReferences.length > 0 && (
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="caption" fontWeight={700} color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                            ⚖️ Căn cứ pháp lý:
                                                        </Typography>
                                                        <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                            {risk.legalReferences.map((ref, rIdx) => (
                                                                <Box key={rIdx} component="li">
                                                                    {ref.url ? (
                                                                        <Typography
                                                                            component="a"
                                                                            href={ref.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: 'primary.main',
                                                                                textDecoration: 'none',
                                                                                '&:hover': { textDecoration: 'underline' }
                                                                            }}
                                                                        >
                                                                            {ref.title}
                                                                        </Typography>
                                                                    ) : (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {ref.title}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}

                                                <Box sx={{ bgcolor: 'success.main', color: 'white', p: 1.5, borderRadius: 1, display: 'flex', gap: 1 }}>
                                                    <LightbulbIcon fontSize="small" />
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>Gợi ý xử lý:</Typography>
                                                        <Typography variant="caption">{risk.suggestion}</Typography>
                                                    </Box>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Tabs for more details */}
                        <Box>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
                                <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)}>
                                    <Tab label="Điều khoản" />
                                    <Tab label="Ngày quan trọng" />
                                    <Tab label="Nghĩa vụ" />
                                    <Tab label="Văn bản gốc" />
                                </Tabs>
                            </Box>

                            {detailTab === 0 && (
                                <List>
                                    {contract.analysis.keyTerms.length > 0 ? contract.analysis.keyTerms.map((term, i) => (
                                        <ListItem key={i} divider={i < contract.analysis!.keyTerms.length - 1}>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight={600}>{term.term}</Typography>}
                                                secondary={term.definition}
                                            />
                                        </ListItem>
                                    )) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Không có dữ liệu</Typography>}
                                </List>
                            )}

                            {detailTab === 1 && (
                                <List>
                                    {contract.analysis.importantDates.length > 0 ? contract.analysis.importantDates.map((date, i) => (
                                        <ListItem key={i} divider={i < contract.analysis!.importantDates.length - 1}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><CalendarTodayIcon fontSize="small" color="primary" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight={600}>{date.date}</Typography>}
                                                secondary={date.description}
                                            />
                                        </ListItem>
                                    )) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Không có dữ liệu</Typography>}
                                </List>
                            )}

                            {detailTab === 2 && (
                                <List>
                                    {contract.analysis.obligations.length > 0 ? contract.analysis.obligations.map((obl, i) => (
                                        <ListItem key={i} divider={i < contract.analysis!.obligations.length - 1}>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight={600}>{obl.party}</Typography>}
                                                secondary={obl.description}
                                            />
                                        </ListItem>
                                    )) : <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>Không có dữ liệu</Typography>}
                                </List>
                            )}

                            {detailTab === 3 && (
                                <Box sx={{ mt: 2 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', maxHeight: '400px', overflowY: 'auto' }}>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6 }}>
                                            {contract.content}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => contract.fileData && downloadBase64File(contract.fileData, contract.name)}
                    startIcon={<DownloadIcon />}
                    disabled={!contract.fileData}
                >
                    Tải xuống file
                </Button>
                <Button
                    onClick={() => {
                        onClose();
                        navigate(`/chat?contractId=${contract.id}`);
                    }}
                    startIcon={<ChatIcon />}
                >
                    Chat về hợp đồng
                </Button>
                <Button onClick={onClose} variant="contained">Đóng</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ContractDetailModal;
