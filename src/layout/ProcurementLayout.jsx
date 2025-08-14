// Deprecated legacy ProcurementLayout – retained as stub for gradual removal.
export default function ProcurementLayout(){
  if (import.meta && import.meta.env && import.meta.env.MODE !== 'production') {
    console.warn('ProcurementLayout is deprecated and returns null.');
  }
  return null;
}
