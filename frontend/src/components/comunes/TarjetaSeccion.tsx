import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';

interface Props { titulo?: string; descripcion?: string; children: ReactNode; }
export function TarjetaSeccion({ titulo, descripcion, children }: Props) {
  return (
    <Card><CardContent sx={{ p: { xs: 2.2, sm: 3 }, '&:last-child': { pb: { xs: 2.2, sm: 3 } } }}>
      <Stack spacing={2.5}>
        {(titulo || descripcion) && <Stack spacing={0.5}>
          {titulo && <Typography variant="h6">{titulo}</Typography>}
          {descripcion && <Typography variant="body2" color="text.secondary">{descripcion}</Typography>}
        </Stack>}
        {children}
      </Stack>
    </CardContent></Card>
  );
}
