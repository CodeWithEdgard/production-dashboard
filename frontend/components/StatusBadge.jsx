// src/components/StatusBadge.jsx
import React from 'react';
import { Box } from '@mui/material';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'ok':
        case 'entregue':
        case 'produção':
            return { bg: '#4caf50', text: 'white' }; // Verde
        case 'pendente recebimento':
        case 'aguardando entrada':
        case 'estrutura':
            return { bg: '#ff9800', text: 'black' }; // Laranja
        case 'troca entre obras':
        case 'falha no recebimento':
            return { bg: '#f44336', text: 'white' }; // Vermelho
        case 'expedição':
            return {bg: '#757575', text: 'white'}; // Cinza
        default:
            return { bg: '#e0e0e0', text: 'black' }; // Cinza claro
    }
};

function StatusBadge({ status }) {
    if (!status) return null;

    const { bg, text } = getStatusColor(status);
    
    return (
        <Box
            component="span"
            sx={{
                backgroundColor: bg,
                color: text,
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase', // Deixa o texto em maiúsculo
            }}
        >
            {status}
        </Box>
    );
}
export default StatusBadge;