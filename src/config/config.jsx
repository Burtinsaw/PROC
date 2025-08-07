// ==============================|| THEME CONSTANT ||============================== //

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';

export const APP_DEFAULT_PATH = '/dashboard/default';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;

export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const MenuOrientation = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal'
};

export const ThemeDirection = {
  LTR: 'ltr',
  RTL: 'rtl'
};

export const PresetColor = {
  DEFAULT: 'default',
  BLUE: 'blue',
  GREEN: 'green',
  ORANGE: 'orange',
  PURPLE: 'purple',
  RED: 'red'
};

// ==============================|| THEME CONFIG ||============================== //

const config = {
  fontFamily: `'Inter', 'Roboto', sans-serif`,
  i18n: 'tr',
  menuOrientation: MenuOrientation.VERTICAL,
  miniDrawer: false,
  container: true,
  mode: ThemeMode.LIGHT,
  presetColor: PresetColor.DEFAULT,
  themeDirection: ThemeDirection.LTR
};

export default config;
