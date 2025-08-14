import { lazy, Suspense } from 'react';

// project imports
import AuthLayout from '../layout/AuthLayout';
import Loader from '../components/Loader';

// render - authentication pages
const AuthLogin = lazy(() => import('../pages/authentication/Login'));
const AuthRegister = lazy(() => import('../pages/authentication/Register'));
const AuthForgotPassword = lazy(() => import('../pages/authentication/ForgotPassword'));

// ==============================|| AUTH ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/auth',
  element: <AuthLayout />,
  children: [
    {
      path: 'login',
      element: (
        <Suspense fallback={<Loader />}>
          <AuthLogin />
        </Suspense>
      )
    },
    {
      path: 'register',
      element: (
        <Suspense fallback={<Loader />}>
          <AuthRegister />
        </Suspense>
      )
    },
    {
      path: 'forgot-password',
      element: (
        <Suspense fallback={<Loader />}>
          <AuthForgotPassword />
        </Suspense>
      )
    }
  ]
};

export default AuthenticationRoutes;