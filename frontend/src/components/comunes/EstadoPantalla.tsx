import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { TarjetaSeccion } from './TarjetaSeccion';

interface Props { icono: ReactNode; titulo: string; descripcion: string; children?: ReactNode; }
export function EstadoPantalla({ icono, titulo, descripcion, children }: Props) {
  return (
    <Box sx={{ maxWidth: 780, mx: 'auto', mt: { xs: 2, md: 5 } }}>
      <TarjetaSeccion><Stack alignItems="center" spacing={2.5} textAlign="center" sx={{ py: { xs: 2, sm: 4 } }}>
        {icono}
        <Typography variant="h5" component="h2">{titulo}</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 550 }}>{descripcion}</Typography>
        {children}
      </Stack></TarjetaSeccion>
    </Box>
  );
}
