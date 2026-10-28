import logoGobierno from '../assets/logos/escudoGobienoMexico.png';
import logoSaludSndifColor from '../assets/logos/Salud_SNDIF_2025_Color.webp';
import logoSaludSndifBlanco from '../assets/logos/Salud_SNDIF_2025_Blanco.webp';
import logoSndif from '../assets/logos/logo6.png';

import logoLlaveMx from '../assets/identidadLlaveMX/logo-llavemx.svg';
import logoLlaveMxPng from '../assets/identidadLlaveMX/Logo_LlaveMX.png';
import fondoLlaveMx from '../assets/identidadLlaveMX/fondo-llave.svg';

import fondoDecorativo from '../assets/fondos/Fondo.webp';
import fondoGris from '../assets/fondos/Fondo2.png';
import fondoClaro from '../assets/fondos/Fondo2.webp';
import fondoEscudoGris from '../assets/fondos/fondoescudo2-1.png';
import fondoEscudoColor from '../assets/fondos/fondoescudo2.png';
import cenefaSndif from '../assets/fondos/cenefa_sndif.png';
import texturaGuinda from '../assets/fondos/textura.webp';
import texturaGuindaAlternativa from '../assets/fondos/textura2.webp';
import texturaClara from '../assets/fondos/textura3.webp';
import imagenJoven from '../assets/fondos/Joven.webp';

import iconoSndif from '../assets/iconos/notificonold.jpg';
import iconoSndifAnterior from '../assets/iconos/notificon.jpg';

export const RECURSOS = {
  logos: {
    gobierno: logoGobierno,
    sndif: {
      color: logoSaludSndifColor,
      blanco: logoSaludSndifBlanco,
      individual: logoSndif,
    },
    llaveMx: {
      principal: logoLlaveMx,
      png: logoLlaveMxPng,
    },
  },

  fondos: {
    llaveMx: fondoLlaveMx,
    sndif: {
      decorativo: fondoDecorativo,
      gris: fondoGris,
      claro: fondoClaro,
      escudoGris: fondoEscudoGris,
      escudoColor: fondoEscudoColor,
      cenefa: cenefaSndif,
    },
  },

  texturas: {
    guinda: texturaGuinda,
    guindaAlternativa: texturaGuindaAlternativa,
    clara: texturaClara,
  },

  imagenes: {
    joven: imagenJoven,
  },

  iconos: {
    sndif: iconoSndif,
    sndifAnterior: iconoSndifAnterior,
  },
} as const;
