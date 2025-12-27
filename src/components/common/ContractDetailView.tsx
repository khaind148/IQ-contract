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
    Chip,
    useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RiskBadge from './RiskBadge';
import type { Contract } from '../../types';

interface ContractDetailViewProps {
    contract: Contract;
    showOriginalContent?: boolean;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`contract-tabpanel-${index}`}
            aria-labelledby={`contract-tab-${index}`}
            {...other}
            style={{ height: '100%', overflow: 'auto' }}
        >
            {value === index && (
                <Box sx={{ py: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ContractDetailView: React.FC<ContractDetailViewProps> = ({ contract, showOriginalContent = true }) => {
    const theme = useTheme();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs at the Top */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={detailTab}
                    onChange={(_, v) => setDetailTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minHeight: 48 }}
                >
                    <Tab label="Tổng quan" icon={<AutoAwesomeIcon fontSize="small" />} iconPosition="start" />
                    <Tab label="Điều khoản" icon={<DescriptionIcon fontSize="small" />} iconPosition="start" />
                    <Tab label="Ngày & Hạn" icon={<CalendarTodayIcon fontSize="small" />} iconPosition="start" />
                    <Tab label="Nghĩa vụ" icon={<AssignmentIcon fontSize="small" />} iconPosition="start" />
                    {showOriginalContent && <Tab label="Văn bản gốc" />}
                </Tabs>
            </Box>

            {/* Content Area */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>

                {/* Tab 0: Overview (Summary + Risks) */}
                <TabPanel value={detailTab} index={0}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {/* Summary */}
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)',
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.2)',
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>
                                Tóm tắt nội dung
                            </Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                {contract.analysis.summary}
                            </Typography>
                        </Paper>

                        {/* Risks */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningIcon fontSize="small" color="warning" />
                                    Phát hiện rủi ro ({contract.analysis.risks.length})
                                </Typography>
                            </Box>

                            {contract.analysis.risks.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {contract.analysis.risks.map((risk, idx) => (
                                        <Accordion
                                            key={idx}
                                            variant="outlined"
                                            disableGutters
                                            sx={{
                                                borderRadius: 2,
                                                '&:before': { display: 'none' },
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                sx={{ px: 2 }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%', pr: 1 }}>
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <RiskBadge severity={risk.severity} />
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.5, pt: 0.5 }}>
                                                        {risk.title}
                                                    </Typography>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                                                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                                                    {risk.description}
                                                </Typography>

                                                {/* Suggestion Box */}
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : '#f1f8e9',
                                                        color: theme.palette.mode === 'dark' ? '#81c784' : '#33691e',
                                                        p: 1.5,
                                                        borderRadius: 2,
                                                        display: 'flex',
                                                        gap: 1.5,
                                                        border: '1px solid',
                                                        borderColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.3)' : '#dcedc8'
                                                    }}
                                                >
                                                    <LightbulbIcon fontSize="small" sx={{ mt: 0.3 }} />
                                                    <Box>
                                                        <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mb: 0.5 }}>
                                                            Gợi ý xử lý:
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {risk.suggestion}
                                                        </Typography>
                                                    </Box>
                                                </Paper>

                                                {/* More details if needed (Quote, Scenarios) could be collapsed or shown primarily */}
                                                {risk.quote && (
                                                    <Box sx={{ mt: 2, pl: 2, borderLeft: '3px solid', borderColor: 'warning.main' }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                            "{risk.quote}"
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            ) : (
                                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'transparent', borderStyle: 'dashed' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Không phát hiện rủi ro đáng kể nào.
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Box>
                </TabPanel>

                {/* Tab 1: Terms */}
                <TabPanel value={detailTab} index={1}>
                    <List>
                        {contract.analysis.keyTerms.length > 0 ? contract.analysis.keyTerms.map((term, i) => (
                            <ListItem key={i} alignItems="flex-start" sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600}>{term.term}</Typography>
                                            {term.section && <Chip label={term.section} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
                                        </Box>
                                    }
                                    secondary={term.definition}
                                />
                            </ListItem>
                        )) : <Typography variant="body2" color="text.secondary">Không có dữ liệu</Typography>}
                    </List>
                </TabPanel>

                {/* Tab 2: Important Dates */}
                <TabPanel value={detailTab} index={2}>
                    <List>
                        {contract.analysis.importantDates.length > 0 ? contract.analysis.importantDates.map((date, i) => (
                            <ListItem key={i} sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <ListItemIcon sx={{ minWidth: 40 }}><CalendarTodayIcon fontSize="small" color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" fontWeight={600}>{date.date}</Typography>
                                            <Chip label={date.type} size="small" color="info" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                        </Box>
                                    }
                                    secondary={date.description}
                                />
                            </ListItem>
                        )) : <Typography variant="body2" color="text.secondary">Không có dữ liệu</Typography>}
                    </List>
                </TabPanel>

                {/* Tab 3: Obligations */}
                <TabPanel value={detailTab} index={3}>
                    <List>
                        {contract.analysis.obligations.length > 0 ? contract.analysis.obligations.map((obl, i) => (
                            <ListItem key={i} alignItems="flex-start" sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <ListItemIcon sx={{ minWidth: 40, mt: 1 }}><AssignmentIcon fontSize="small" color="success" /></ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <Chip label={obl.party} size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                            {obl.priority === 'high' && <Chip label="Quan trọng" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem' }} />}
                                        </Box>
                                    }
                                    secondary={obl.description}
                                />
                            </ListItem>
                        )) : <Typography variant="body2" color="text.secondary">Không có dữ liệu</Typography>}
                    </List>
                </TabPanel>

                {/* Tab 4: Original Text */}
                <TabPanel value={detailTab} index={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                            {contract.content}
                        </Typography>
                    </Paper>
                </TabPanel>
            </Box>
        </Box>
    );
};

export default ContractDetailView;
