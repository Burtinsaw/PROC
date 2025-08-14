// Deprecated legacy header – now a stub.
export default function ProcurementHeader(){
  if (import.meta && import.meta.env && import.meta.env.MODE !== 'production') {
    console.warn('ProcurementHeader is deprecated and returns null.');
  }
  return null;
}
