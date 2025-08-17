import React from 'react';
import { useFeatures } from '../../contexts/FeatureContext';
import Forbidden403 from '../../pages/Forbidden403';
import Loader from '../Loader';

export default function FeatureGuard({ module: moduleKey, feature, children }) {
  const { loading, modules, features } = useFeatures();
  if (loading) return <Loader />;
  if (moduleKey && modules && modules[moduleKey] === false) return <Forbidden403 />;
  if (feature && features && features[feature] === false) return <Forbidden403 />;
  return children;
}
