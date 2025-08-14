// Deprecated switcher now always returns AppShellLayout
import AppShellLayout from './AppShellLayout';
export default function LayoutSelector(props){
  return <AppShellLayout {...props} />;
}
