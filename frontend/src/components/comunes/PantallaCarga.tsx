import { Box, CircularProgress, Stack, Typography } from '@mui/material';
export function PantallaCarga({ mensaje = 'Cargando...' }: { mensaje?: string }) {
  return <Box component="main" sx={{ minHeight: '45vh', display: 'grid', placeItems: 'center', p: 4 }} role="status"><Stack alignItems="center" spacing={2}><CircularProgress /><Typography color="text.secondary">{mensaje}</Typography></Stack></Box>;
}
