import { extendTheme } from '@mui/joy/styles';

// SEB färgpalett baserad på https://designlibrary.sebgroup.com/
const sebColors = {
  // Primära färger
  sebGreen: {
    50: '#e0f2e9',
    100: '#b3dcc8',
    200: '#80c5a3',
    300: '#4dae7e',
    400: '#269c63',
    500: '#007934', // SEB Green - exakt enligt designguiden
    600: '#007d41',
    700: '#006d38',
    800: '#005e30',
    900: '#004321',
  },
  // Sekundära färger
  sebBlue: {
    500: '#0092c5', // SEB Blue
  },
  sebPurple: {
    500: '#614c7f', // SEB Purple
  },
  sebLightGreen: {
    500: '#52b878', // SEB Light Green
  },
  sebYellow: {
    500: '#ffe600', // SEB Yellow
  },
  sebOrange: {
    500: '#ff5f00', // SEB Orange
  },
  sebPink: {
    500: '#ee3f7d', // SEB Pink
  },
  // Neutrala färger
  sebDarkGrey: {
    500: '#333333', // SEB Dark Grey
  },
  sebMediumGrey: {
    500: '#767676', // SEB Medium Grey
  },
  sebLightGrey: {
    500: '#f5f5f5', // SEB Light Grey
  },
};

// Skapa temat
const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: sebColors.sebGreen[50],
          100: sebColors.sebGreen[100],
          200: sebColors.sebGreen[200],
          300: sebColors.sebGreen[300],
          400: sebColors.sebGreen[400],
          500: sebColors.sebGreen[500], // SEB Green som huvudfärg
          600: sebColors.sebGreen[600],
          700: sebColors.sebGreen[700],
          800: sebColors.sebGreen[800],
          900: sebColors.sebGreen[900],
        },
        // Färger för olika statustillstånd
        success: {
          500: sebColors.sebGreen[500],
        },
        // Färger för neutrala element
        neutral: {
          outlinedBorder: sebColors.sebMediumGrey[500],
          outlinedHoverBg: sebColors.sebLightGrey[500],
        },
        background: {
          body: '#fff',
          surface: '#fff',
          popup: '#fff',
          level1: sebColors.sebLightGrey[500],
          level2: '#fff',
          level3: '#fff',
        },
      },
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 600,
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
      },
    },
  },
  fontFamily: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

export default theme;