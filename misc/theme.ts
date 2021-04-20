import { ThemeOptions, Theme } from '@material-ui/core'
import { Palette, PaletteColor } from '@material-ui/core/styles/createPalette'

interface CustomPalette extends Palette {
  tagColor: { [key: string]: string }
  translucent: string
  indicator: string
  pieChart: { [key: string]: PaletteColor }
}

export interface CustomTheme extends Theme {
  palette: CustomPalette
}

const common = {
  typography: {
    fontFamily: '"Hind Madurai", sans-serif',
    h1: {
      fontSize: '2.25rem',
      letterSpacing: -1.5,
    },
    h2: {
      fontFamily: '"Aurulent Sans Mono", sans-serif',
      fontSize: '1.875rem',
      letterSpacing: -0.5,
    },
    h3: {
      fontFamily: '"Aurulent Sans Mono", sans-serif',
      fontSize: '1.75rem',
      letterSpacing: 0,
    },
    h4: {
      fontSize: '1.5rem',
      letterSpacing: 0.25,
    },
    h5: {
      fontFamily: '"Aurulent Sans Mono", sans-serif',
      fontSize: '1.25rem',
      letterSpacing: 0,
    },
    h6: {
      fontSize: '1.125rem',
      letterSpacing: 0.15,
    },
    subtitle1: {
      fontSize: '1rem',
      letterSpacing: 0.15,
    },
    subtitle2: {
      fontFamily: '"Hind Madurai Medium", sans-serif',
      fontSize: '0.875rem',
      letterSpacing: 0.1,
    },
    body1: {
      fontSize: '1rem',
      whiteSpace: 'pre-wrap',
    },
    body2: {
      fontSize: '0.875rem',
    },
    overline: {
      fontFamily: '"Hind Madurai Medium", sans-serif',
      fontSize: '0.875rem',
      letterSpacing: 1.25,
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: 0.4,
    },
    button: {
      fontSize: '1rem',
      letterSpacing: 0,
      textTransform: 'none',
    },
  },
  shadows: [...Array(7).fill('none'), ...Array(18).fill('0px 3px 16px #00000029')],
}

const lightTheme = ({
  ...common,
  palette: {
    primary: {
      main: '#5C7BFF',
    },
    secondary: {
      main: '#FCB836',
    },
    info: {
      main: '#1D86FF',
    },
    success: {
      main: '#1EC490',
    },
    warning: {
      main: '#E0A111',
      light: '#FCD32A',
    },
    error: {
      main: '#FD565F',
    },
    text: {
      primary: '#000000',
      secondary: '#646464',
    },
    background: {
      default: '#F2F2F2',
      paper: '#FFFFFF',
    },
    grey: {
      50: '#F7F7F7',
      100: '#F2F2F2',
      200: '#DDDDDD',
      300: '#8B8B8B',
      400: '#F7F7F7',
      500: '#777777',
    },
    action: {
      hover: '#F7F7F7',
      selected: '#F7F7F7',
    },
    tagColor: {
      delegate: '#1EC490',
      redelegate: '#FF961B',
      undelegate: '#FC6A8A',
      deposit: '#FF7549',
      withdrawReward: '#243059',
      multisend: '#9F46EC',
      createValidator: '#1EC490',
      fund: '#497BFF',
      verifyInvariant: '#2FA8CE',
      vote: '#FF7549',
      unjail: '#EB3AA4',
      submitProposal: '#FF7549',
      editValidator: '#1EC490',
      send: '#9F46EC',
      setRewardAddress: '#497BFF',
    },
    translucent: 'rgba(255, 255, 255, 0.5)',
    indicator: '#5C7BFF',
    pieChart: {
      color1: {
        main: '#007FFF',
      },
      color2: {
        main: '#6ED588',
      },
      color3: {
        main: '#2DCBE0',
      },
      color4: {
        main: '#74CDFF',
      },
      color5: {
        main: '#DEC053',
      },
      color6: {
        main: '#F4B65A',
      },
    },
  },
} as unknown) as ThemeOptions

const darkTheme = ({
  ...common,
  palette: {
    primary: {
      main: '#007FFF',
    },
    secondary: {
      main: '#ECB140',
    },
    info: {
      main: '#1D86FF',
    },
    success: {
      main: '#1EC490',
    },
    warning: {
      main: '#E0A111',
    },
    error: {
      main: '#FD565F',
    },
    text: {
      primary: '#E6E6E6',
      secondary: '#9D9D9D',
    },
    background: {
      default: '#1D1E22',
      paper: '#25282D',
    },
    grey: {
      50: '#272A2F',
      100: '#34383E',
      200: '#3D4047',
      300: '#AFAFAF',
      400: '#2B2F35',
      500: '#777777',
    },
    action: {
      hover: '#1D1E22',
      selected: '#1D1E22',
    },
    tagColor: {
      delegate: '#1EC490',
      redelegate: '#FF961B',
      undelegate: '#FC6A8A',
      deposit: '#FF7549',
      withdrawReward: '#3961FE',
      multisend: '#9F46EC',
      createValidator: '#1EC490',
      fund: '#497BFF',
      verifyInvariant: '#2FA8CE',
      vote: '#FF7549',
      unjail: '#EB3AA4',
      submitProposal: '#FF7549',
      editValidator: '#1EC490',
      send: '#9F46EC',
      setRewardAddress: '#497BFF',
    },
    translucent: 'rgba(0, 0, 0, 0.5)',
    indicator: '#E6E6E6',
    pieChart: {
      color1: {
        main: '#007FFF',
      },
      color2: {
        main: '#6ED588',
      },
      color3: {
        main: '#2DCBE0',
      },
      color4: {
        main: '#74CDFF',
      },
      color5: {
        main: '#DEC053',
      },
      color6: {
        main: '#F4B65A',
      },
    },
  },
} as unknown) as ThemeOptions

export { lightTheme, darkTheme }
