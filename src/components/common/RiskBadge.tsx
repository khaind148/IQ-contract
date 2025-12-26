import React from 'react';
import { Chip, useTheme } from '@mui/material';
import { RISK_SEVERITY_LABELS } from '../../types';
import type { RiskItem } from '../../types';

interface RiskBadgeProps {
    severity: RiskItem['severity'];
    size?: 'small' | 'medium';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ severity, size = 'small' }) => {
    const theme = useTheme();

    const colors: Record<RiskItem['severity'], { bg: string; text: string }> = {
        critical: {
            bg: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
            text: '#f44336',
        },
        high: {
            bg: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)',
            text: '#ff9800',
        },
        medium: {
            bg: theme.palette.mode === 'dark' ? 'rgba(255, 235, 59, 0.2)' : 'rgba(255, 235, 59, 0.15)',
            text: theme.palette.mode === 'dark' ? '#ffeb3b' : '#f9a825',
        },
        low: {
            bg: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
            text: '#4caf50',
        },
    };

    return (
        <Chip
            label={RISK_SEVERITY_LABELS[severity]}
            size={size}
            sx={{
                backgroundColor: colors[severity].bg,
                color: colors[severity].text,
                fontWeight: 600,
                borderRadius: 1.5,
                border: `1px solid ${colors[severity].text}40`,
            }}
        />
    );
};

export default RiskBadge;
