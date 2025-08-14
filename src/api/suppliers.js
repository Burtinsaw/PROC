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
