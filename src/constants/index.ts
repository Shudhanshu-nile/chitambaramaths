import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = Math.max(width, height);
const SCREEN_WIDTH = Math.min(width, height);



// Screen dimension helpers
export const responsiveScreenHeight = (value: number) => {
    return (value / 100) * SCREEN_HEIGHT;
};

export const responsiveScreenWidth = (value: number) => {
    return (value / 100) * SCREEN_WIDTH;
};

// Colors
export const Colors = {
    // Primary colors
    blueDark: '#005884',

    primaryBlue: '#1c75bc',
    primaryDarkBlue: '#0c4b8b',

    // UI colors
    white: '#ffffff',
    black: '#000000',
    gray: '#999',
    lightGray: '#f5f5f5',
    borderGray: '#eee',
    textGray: '#333',

    // Background colors for quick actions
    lightBlue1: '#eef6f8',
    lightBlue2: '#E1E8EE',
    lightBlue3: '#E1F0F5',
    lightGreen1: '#f0f7f2',
    lightGreen2: '#E0E8E3',
    lightGreen3: '#D1E8E2',
    lightGreen4: '#E0EAE4',

    // Icon colors
    iconBlue1: '#0c4b8b',
    iconBlue2: '#1c75bc',
    iconBlue3: '#2196f3',
    iconBlue4: '#2e7db5',
    iconGreen: '#4caf50',
    iconTeal: '#009688',

    // Alert/Tag colors
    red: '#ff5252',
    alertRed: '#ff5252',

    // Transparent overlays
    whiteOverlay20: 'rgba(255,255,255,0.2)',
    whiteOverlay25: 'rgba(255,255,255,0.25)',
    whiteOverlay30: 'rgba(255,255,255,0.3)',
    whiteOverlay60: 'rgba(255,255,255,0.6)',
    whiteOverlay80: 'rgba(255,255,255,0.8)',

    // Other
    backgroundColor: '#f5f5f5',
};

// Fonts
export const Fonts = {
    InterRegular: 'Inter-Regular',
    InterMedium: 'Inter-Medium',
    InterSemiBold: 'Inter-SemiBold',
    InterBold: 'Inter-Bold',
};

// Screen Names
export const ScreenNames = {
    Splash: 'Splash',
    Welcome: 'Welcome',
    Home: 'Home',
    Login: 'Login',
    Register: 'Register',
    Main: 'Main',
    Centers: 'Centers',
    Tickets: 'Tickets',
    Store: 'Store',
    Profile: 'Profile',
    RegisterExam: 'RegisterExam',
    PurchaseSuccessful: 'PurchaseSuccessful',
};

// Gradient colors
export const Gradients = {
    primaryBlue: [Colors.primaryBlue, Colors.primaryDarkBlue],
};

// Common dimensions and spacing
export const Spacing = {
    borderRadius: {
        small: 8,
        medium: 12,
        large: 15,
        xlarge: 20,
        xxlarge: 30,
    },
    spacing: {
        xs: 5,
        sm: 10,
        md: 15,
        lg: 20,
        xl: 30,
    },
    iconSize: {
        small: 20,
        medium: 24,
        large: 28,
        xlarge: 36,
    },
};

// Font sizes
export const FontSizes = {
    xs: 11,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
};

// Validation helpers
export function isValidPassword(password: string) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,10}$/;
    return regex.test(password);
}

export function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export enum DataType {
    FORMDATA = 'FORMDATA',
}
