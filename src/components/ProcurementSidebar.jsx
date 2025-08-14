// Deprecated legacy sidebar – stub.
export default function ProcurementSidebar(){
  if (import.meta && import.meta.env && import.meta.env.MODE !== 'production') {
    console.warn('ProcurementSidebar is deprecated and returns null.');
  }
  return null;
}
