import { LOGIN, LOGOUT, INITIALIZE } from './actions';

// ==============================|| AUTH REDUCER ||============================== //

const authReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE: {
      return {
        ...state,
        isInitialized: true
      };
    }
    case LOGIN: {
      return {
        ...state,
        isLoggedIn: action.payload.isLoggedIn,
        isInitialized: true,
        user: action.payload.user
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isLoggedIn: false,
        isInitialized: true,
        user: null
      };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
};

export default authReducer;
