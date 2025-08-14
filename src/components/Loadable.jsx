import { Suspense, createElement } from 'react';

// project imports
import Loader from './Loader';

// ==============================|| LOADABLE - LAZY LOADING ||============================== //

const Loadable = (Comp) => (props) => (
  createElement(
    Suspense,
    { fallback: createElement(Loader) },
    createElement(Comp, props)
  )
);

export default Loadable;