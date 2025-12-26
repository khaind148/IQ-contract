import React, { useCallback, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    useTheme,
    CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    loading?: boolean;
    label?: string;
    description?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    accept = '.pdf,.txt',
    loading = false,
    label = 'Tải lên hợp đồng',
    description = 'Kéo thả file hoặc click để chọn (PDF, TXT)',
}) => {
    const theme = useTheme();
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    }, [onFileSelect]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    }, [onFileSelect]);

    return (
        <Paper
            component="label"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 200,
                border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: dragActive
                    ? `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}10 100%)`
                    : theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.02)'
                        : 'rgba(0,0,0,0.02)',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}05 0%, ${theme.palette.secondary.main}05 100%)`,
                },
            }}
        >
            <input
                type="file"
                accept={accept}
                onChange={handleChange}
                style={{ display: 'none' }}
                disabled={loading}
            />

            {loading ? (
                <CircularProgress size={48} />
            ) : selectedFile ? (
                <>
                    <InsertDriveFileIcon
                        sx={{
                            fontSize: 48,
                            color: theme.palette.primary.main,
                            mb: 2,
                        }}
                    />
                    <Typography variant="body1" fontWeight={500}>
                        {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                </>
            ) : (
                <>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                        }}
                    >
                        <CloudUploadIcon
                            sx={{
                                fontSize: 40,
                                color: theme.palette.primary.main,
                            }}
                        />
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={0.5}>
                        {label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </>
            )}
        </Paper>
    );
};

export default FileUpload;
