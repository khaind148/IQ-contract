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
                <ContractDetailView contract={contract} />
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
