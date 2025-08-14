import { useContext } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import AuthContext from '../../contexts/AuthContext';

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default AuthGuard;
