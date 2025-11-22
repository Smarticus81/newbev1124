/**
 * Theme System - Exact match to Flutter AppThemeData
 * Preserves all colors, typography, and design tokens
 */

export const brandColors = {
    roastDark: '#343434',
    redWheat: '#343434',
    lager: '#E6B31E',
    cider: '#E1E167',
    forth: '#E1E167',
    forest: '#17223B',
    pine: '#263859',
    shore: '#6B778D',
    roastLight: '#E6B31E',
    buttonSelection: '#FFC531',
    buttonSelectionText: '#703A00',
    radioButtonCircle: '#E9E9E9',
    backgroundColor: '#FBFBFB',
} as const;

export const neutralColors = {
    1000: '#12262B',
    900: '#193238',
    800: '#284952',
    700: '#395C65',
    600: '#567881',
    500: '#86A0A7',
    400: '#A5BEC5',
    300: '#BCD5DC',
    200: '#DCEBEF',
    100: '#F1F7F9',
    0: '#FFFFFF',
    fill: '#E2EFF3',
} as const;

export const blueColors = {
    1000: '#050B3C',
    900: '#0C177D',
    800: '#1325BE',
    700: '#283CE4',
    600: '#5A69E6',
    500: '#7C88EA',
    400: '#959EEF',
    300: '#C2C7F7',
    200: '#DFE2FC',
    100: '#F1F2FE',
} as const;

export const greenColors = {
    1000: '#032617',
    900: '#074B2E',
    800: '#0B6F46',
    700: '#12915C',
    600: '#1BB675',
    500: '#22CE86',
    400: '#71EAB7',
    300: '#A9F4D5',
    200: '#CCFAE7',
    100: '#F1FEF8',
} as const;

export const redColors = {
    1000: '#260D03',
    900: '#4F1C07',
    800: '#822E0D',
    700: '#A33D14',
    600: '#BF4A1D',
    500: '#DB5824',
    400: '#E9906D',
    300: '#F4BEA9',
    200: '#FAD9CC',
    100: '#FEF5F1',
} as const;

export const orangeColors = {
    1000: '#281401',
    900: '#632A03',
    800: '#864709',
    700: '#AE5C09',
    600: '#D06E0B',
    500: '#F2800D',
    400: '#F7AB5F',
    300: '#FACFA3',
    200: '#FDE3C9',
    100: '#FFF7F0',
} as const;

// Category card colors (for product categories)
export const categoryColors = {
    lightBlue: '#E3F4F7',
    lightGreen: '#CCFAE7',
    lightYellow: '#F4F6B1',
    lightOrange: '#F7E6D3',
    lightTeal: '#E1F7F1',
    lightPurple: '#EDE7F8',
} as const;

// Typography - Instrument Sans font family
export const typography = {
    headingH1: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 600,
        fontSize: '34px',
        letterSpacing: '-0.544px',
        lineHeight: '34px',
    },
    headingH2: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 600,
        fontSize: '28px',
        letterSpacing: '-0.42px',
        lineHeight: '32px',
    },
    headingH3: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 600,
        fontSize: '24px',
        letterSpacing: '-0.36px',
        lineHeight: '28px',
    },
    headingH4: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 600,
        fontSize: '22px',
        letterSpacing: '-0.319px',
        lineHeight: '26px',
    },
    headingH5: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 600,
        fontSize: '20px',
        letterSpacing: '-0.27px',
        lineHeight: '24px',
    },
    headingH6: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 600,
        fontSize: '18px',
        letterSpacing: '-0.234px',
        lineHeight: '25px',
    },
    textHeading: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '24px',
    },
    calloutText: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 600,
        fontSize: '14px',
        lineHeight: '20px',
    },
    callText: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '20px',
    },
    subheadText: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
    },
    notationText: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 500,
        fontSize: '13px',
        lineHeight: '19px',
    },
    footnoteText: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 400,
        fontSize: '13px',
        lineHeight: '19px',
    },
    caption1: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 400,
        fontSize: '12px',
        lineHeight: '16px',
    },
    caption2: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 400,
        fontSize: '11px',
        lineHeight: '15px',
    },
    buttonLevel: {
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 500,
        fontSize: '14px',
        lineHeight: '1.0',
    },
} as const;

// Spacing system
export const spacing = {
    2: '2px',
    3: '3px',
    4: '4px',
    5: '5px',
    6: '6px',
    7: '7px',
    8: '8px',
    9: '9px',
    10: '10px',
    11: '11px',
    12: '12px',
    13: '13px',
    14: '14px',
    15: '15px',
    16: '16px',
    17: '17px',
    18: '18px',
    19: '19px',
    20: '20px',
    21: '21px',
    22: '22px',
    24: '24px',
    25: '25px',
    26: '26px',
    27: '27px',
    28: '28px',
    29: '29px',
    30: '30px',
    32: '32px',
    34: '34px',
    36: '36px',
    40: '40px',
    44: '44px',
    48: '48px',
    50: '50px',
    52: '52px',
    56: '56px',
    60: '60px',
} as const;

// Border radius
export const borderRadius = {
    small: '4px',
    medium: '8px',
    large: '12px',
    xlarge: '16px',
    round: '50%',
} as const;

// Shadows
export const shadows = {
    small: '0 1px 2px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.07)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
} as const;

// Complete theme object
export const theme = {
    brand: brandColors,
    neutral: neutralColors,
    blue: blueColors,
    green: greenColors,
    red: redColors,
    orange: orangeColors,
    category: categoryColors,
    typography,
    spacing,
    borderRadius,
    shadows,
} as const;

export type Theme = typeof theme;
