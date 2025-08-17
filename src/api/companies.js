import axios from '../utils/axios';

export async function createCompany(payload) {
  const { data } = await axios.post('/companies', payload);
  return data;
}

export async function checkCompanyDuplicate(params = {}) {
  const qp = new URLSearchParams();
  if (params.name) qp.set('name', params.name);
  if (params.website) qp.set('website', params.website);
  if (params.email) qp.set('email', params.email);
  const { data } = await axios.get(`/companies/check-duplicate?${qp.toString()}`);
  return data; // { duplicate, count, matches }
}

export async function exportCompanies(params = {}) {
  // Backend JSON döndürür; burada response'u alıp çağırana iletiriz
  const res = await axios.get('/companies/export', { params });
  return { data: res.data, headers: res.headers };
}

export async function getCompanyById(id) {
  const { data } = await axios.get(`/companies/${id}`);
  return data;
}

export async function importCompanies(companies) {
  const payload = { companies: Array.isArray(companies) ? companies : [] };
  const { data } = await axios.post('/companies/import', payload);
  return data; // { message, created, updated, total }
}
