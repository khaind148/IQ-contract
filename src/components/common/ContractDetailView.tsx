import React from 'react';
import {
    Box,
    Typography,
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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RiskBadge from './RiskBadge';
import type { Contract } from '../../types';

interface ContractDetailViewProps {
    contract: Contract;
    showOriginalContent?: boolean;
}

const ContractDetailView: React.FC<ContractDetailViewProps> = ({ contract, showOriginalContent = true }) => {
    const [detailTab, setDetailTab] = React.useState(0);

    if (!contract.analysis) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <AnalyticsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography color="text.secondary">
                    Hợp đồng này chưa được phân tích. Hãy sử dụng tính năng "Phân tích hợp đồng" để bắt đầu.
                </Typography>
            </Box>
        );
    }

    return (
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
                                        <RiskBadge severity={risk.severity} />
                                        <Typography variant="body2" fontWeight={600}>{risk.title}</Typography>
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
                    <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} variant="scrollable" scrollButtons="auto">
                        <Tab label="Điều khoản" />
                        <Tab label="Ngày quan trọng" />
                        <Tab label="Nghĩa vụ" />
                        {showOriginalContent && <Tab label="Văn bản gốc" />}
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

                {detailTab === 3 && showOriginalContent && (
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
    );
};

export default ContractDetailView;
