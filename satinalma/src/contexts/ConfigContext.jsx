import { createContext, useReducer } from 'react';
import config, { ThemeMode, PresetColor } from '../config/config.jsx';

// Initial state
const initialState = {
  ...config
};

// Action types
const CHANGE_MODE = 'CHANGE_MODE';
const CHANGE_PRESET_COLOR = 'CHANGE_PRESET_COLOR';
const CHANGE_FONT_FAMILY = 'CHANGE_FONT_FAMILY';
const RESET_CONFIG = 'RESET_CONFIG';

// Reducer
const configReducer = (state, action) => {
  switch (action.type) {
    case CHANGE_MODE:
      return {
        ...state,
        mode: action.payload
      };
    case CHANGE_PRESET_COLOR:
      return {
        ...state,
        presetColor: action.payload
      };
    case CHANGE_FONT_FAMILY:
      return {
        ...state,
        fontFamily: action.payload
      };
    case RESET_CONFIG:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

// Context
const ConfigContext = createContext();

// Provider
export const ConfigProvider = ({ children }) => {
  const [config, dispatch] = useReducer(configReducer, initialState);

  const changeMode = (mode) => {
    dispatch({
      type: CHANGE_MODE,
      payload: mode
    });
  };

  const changePresetColor = (color) => {
    dispatch({
      type: CHANGE_PRESET_COLOR,
      payload: color
    });
  };

  const changeFontFamily = (fontFamily) => {
    dispatch({
      type: CHANGE_FONT_FAMILY,
      payload: fontFamily
    });
  };

  const resetConfig = () => {
    dispatch({
      type: RESET_CONFIG
    });
  };

  const toggleMode = () => {
    const newMode = config.mode === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
    changeMode(newMode);
  };

  return (
    <ConfigContext.Provider
      value={{
        ...config,
        changeMode,
        changePresetColor,
        changeFontFamily,
        resetConfig,
        toggleMode
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
