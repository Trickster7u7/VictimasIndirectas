import { Box, Link, Stack, Typography } from '@mui/material';
import { DISENO } from '../../config/diseno.config';
import { RECURSOS } from '../../config/recursos';

export function PiePagina() {
  return (
<Box
  component="footer"
  sx={{
    bgcolor: DISENO.colores.guinda,
    color: "#fff",
    px: { xs: 2, md: 4 },
    py: 2.4,
    mt: "auto",
  }}
>
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    gap={2}
  >
    <Box
      component="img"
      src={RECURSOS.logos.sndif.blanco}
      alt="Gobierno de México"
      sx={{
        height: 31,
        maxWidth: 165,
        objectFit: "contain",
        objectPosition: "left",
      }}
    />

    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      flexWrap="wrap"
      sx={{ typography: "caption", opacity: 0.9 }}
    >
      <Typography variant="caption">
        {DISENO.marca.version}
      </Typography>

      <Typography variant="caption">•</Typography>

      <Link
        href="/terminos"
        underline="none"
        color="inherit"
        sx={{
          transition: "all .2s",
          "&:hover": {
            opacity: 1,
            textDecoration: "underline",
          },
        }}
      >
        Términos y condiciones
      </Link>

      <Typography variant="caption">•</Typography>

      <Link
        href="/privacidad"
        underline="none"
        color="inherit"
        sx={{
          transition: "all .2s",
          "&:hover": {
            opacity: 1,
            textDecoration: "underline",
          },
        }}
      >
        Aviso de privacidad
      </Link>
    </Stack>
  </Stack>
</Box>

  );
}
