import axios from '../utils/axios';

export async function researchSuppliers({ query, brand, article, targetCountry } = {}) {
  const payload = {};
  if (query) payload.query = query;
  if (brand) payload.brand = brand;
  if (article) payload.article = article;
  if (targetCountry) payload.targetCountry = targetCountry;
  const { data } = await axios.post('/suppliers/research', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Tedarikçi araştırması başarısız');
  }
  return data?.suggestions || [];
}

// Full payload (jobId dahil)
export async function researchSuppliersFull({ query, brand, article, targetCountry } = {}) {
  const payload = {};
  if (query) payload.query = query;
  if (brand) payload.brand = brand;
  if (article) payload.article = article;
  if (targetCountry) payload.targetCountry = targetCountry;
  const { data } = await axios.post('/suppliers/research', payload);
  if (data?.success === false) {
    throw new Error(data?.message || 'Tedarikçi araştırması başarısız');
  }
  return { suggestions: data?.suggestions || [], jobId: data?.jobId, count: data?.count ?? (data?.suggestions?.length || 0) };
}

export async function getResearchJobs(options = 50) {
  // Back-compat: number verilirse limit olarak kullan
  const params = typeof options === 'number' ? { limit: options } : { ...options };
  const { data } = await axios.get('/suppliers/research/jobs', { params });
  if (data?.success === false) throw new Error(data?.message || 'Geçmiş getirilemedi');
  return { jobs: data?.jobs || [], count: data?.count ?? (data?.jobs?.length || 0), limit: data?.limit, offset: data?.offset };
}

export async function getResearchJob(id) {
  const { data } = await axios.get(`/suppliers/research/${id}`);
  if (data?.success === false) throw new Error(data?.message || 'Kayıt getirilemedi');
  return data;
}

export async function markResearchSaved(id, indices) {
  const { data } = await axios.post(`/suppliers/research/${id}/saved`, { indices });
  if (data?.success === false) throw new Error(data?.message || 'Kayıt güncellenemedi');
  return data?.savedIndices || [];
}

export async function getResearchSavedMap(id) {
  const { data } = await axios.get(`/suppliers/research/${id}/saved-map`);
  if (data?.success === false) throw new Error(data?.message || 'Saved map getirilemedi');
  return data?.items || [];
}

export async function setResearchSavedMap(id, { index, companyId }) {
  const { data } = await axios.post(`/suppliers/research/${id}/saved-map`, { index, companyId });
  if (data?.success === false) throw new Error(data?.message || 'Saved map güncellenemedi');
  return data?.item;
}
