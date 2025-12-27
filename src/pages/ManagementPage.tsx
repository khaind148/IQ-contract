import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import ChatIcon from '@mui/icons-material/Chat';
import FolderIcon from '@mui/icons-material/Folder';
import WarningIcon from '@mui/icons-material/Warning';
import { useAppDispatch, useAppSelector } from '../store';
import { deleteContract } from '../store/slices/contractSlice';
import ContractDetailModal from '../components/common/ContractDetailModal';
import { downloadBase64File } from '../utils/fileUtils';
import { CATEGORY_LABELS, type Contract } from '../types';

const ManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const contracts = useAppSelector((state) => state.contracts.contracts);

    const [searchTerm, setSearchTerm] = useState('');

    // Safety fix: Ensure body scroll is not locked
    useEffect(() => {
        document.body.style.overflow = 'unset';
    }, []);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [contractToDelete, setContractToDelete] = useState<string | null>(null);

    const filteredContracts = contracts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenDetails = (contract: Contract) => {
        setSelectedContract(contract);
        setModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setContractToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (contractToDelete) {
            dispatch(deleteContract(contractToDelete));
            setDeleteConfirmOpen(false);
            setContractToDelete(null);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Quản lý hợp đồng
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Xem danh sách, chi tiết và quản lý các hợp đồng đã lưu
                    </Typography>
                </Box>
            </Box>

            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <TextField
                        fullWidth
                        placeholder="Tìm kiếm theo tên hợp đồng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                </CardContent>
            </Card>

            <TableContainer component={Paper} variant="outlined">
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell><Typography fontWeight={600}>Tên hợp đồng</Typography></TableCell>
                            <TableCell><Typography fontWeight={600}>Loại</Typography></TableCell>
                            <TableCell><Typography fontWeight={600}>Ngày tải lên</Typography></TableCell>
                            <TableCell><Typography fontWeight={600}>Kích thước</Typography></TableCell>
                            <TableCell><Typography fontWeight={600}>Trạng thái</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight={600}>Thao tác</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredContracts.length > 0 ? filteredContracts.map((contract) => (
                            <TableRow key={contract.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <FolderIcon color="primary" />
                                        <Typography fontWeight={500}>{contract.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={CATEGORY_LABELS[contract.category] || contract.category}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(contract.uploadedAt).toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell>
                                    {(contract.fileSize / 1024).toFixed(1)} KB
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {contract.analysis ? (
                                            <Chip label="Đã phân tích" size="small" color="success" />
                                        ) : (
                                            <Chip label="Chưa phân tích" size="small" variant="outlined" />
                                        )}
                                        {contract.analysis?.risks && contract.analysis.risks.length > 0 && (
                                            <Tooltip title={`${contract.analysis.risks.length} rủi ro`}>
                                                <WarningIcon color="warning" fontSize="small" />
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        onClick={() => handleOpenDetails(contract)}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton
                                        color="info"
                                        size="small"
                                        onClick={() => navigate(`/chat?contractId=${contract.id}`)}
                                        title="Chat về hợp đồng"
                                    >
                                        <ChatIcon />
                                    </IconButton>
                                    <IconButton
                                        color="secondary"
                                        size="small"
                                        onClick={() => contract.fileData && downloadBase64File(contract.fileData, contract.name)}
                                        disabled={!contract.fileData}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeleteClick(contract.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">
                                        Không tìm thấy hợp đồng nào
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Reusable Detail Modal */}
            <ContractDetailModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                contract={selectedContract}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa hợp đồng này? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Hủy</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">Xóa</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ManagementPage;
