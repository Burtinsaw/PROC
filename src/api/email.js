import axios from '../utils/axios';

export async function listInbox({ limit = 50, offset = 0, q, companies } = {}){
  const params = {};
  if(limit) params.limit = limit;
  if(offset) params.offset = offset;
  if(q) params.q = q;
  if(companies && companies.length) params.companies = companies.join(',');
  const { data } = await axios.get('/email/inbox', { params });
  return data;
}

export async function seedInbox(){
  const { data } = await axios.post('/email/inbox/seed');
  return data;
}
