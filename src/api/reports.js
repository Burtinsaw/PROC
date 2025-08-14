import axios from '../utils/axios';

export async function getFinanceAging(params = {}) {
  const search = new URLSearchParams(params);
  const { data } = await axios.get(`/reports/finance/aging${search.toString() ? `?${search.toString()}` : ''}`);
  return data;
}

export async function getFinanceCashflow(params = {}) {
  const search = new URLSearchParams(params);
  const { data } = await axios.get(`/reports/finance/cashflow${search.toString() ? `?${search.toString()}` : ''}`);
  return data;
}

export async function getSpendBySupplier(params = {}) {
  const search = new URLSearchParams(params);
  const { data } = await axios.get(`/reports/procurement/spend-by-supplier${search.toString() ? `?${search.toString()}` : ''}`);
  return data;
}

export async function getLogisticsKPIs() {
  const { data } = await axios.get(`/reports/logistics/kpis`);
  return data;
}

export async function getPOStatusBreakdown() {
  const { data } = await axios.get(`/reports/po/status-breakdown`);
  return data;
}

export async function getCompanyTypeSummary() {
  const { data } = await axios.get(`/reports/companies/type-summary`);
  return data;
}

export const reportsApi = {
  getFinanceAging,
  getFinanceCashflow,
  getSpendBySupplier,
  getLogisticsKPIs,
  getPOStatusBreakdown,
  getCompanyTypeSummary,
};
