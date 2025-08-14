import axios from '../utils/axios';

export async function fetchRequests({ page = 1, limit = 20, status, q } = {}) {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (status) params.append('status', status);
  if (q) params.append('q', q);
  const { data } = await axios.get(`/requests?${params.toString()}`);
  return data;
}

export async function createRequest(body) {
  const { data } = await axios.post('/requests', body);
  return data.request;
}

export async function getRequest(id, { withStaging = false } = {}) {
  const { data } = await axios.get(`/requests/${id}${withStaging ? '?withStaging=true' : ''}`);
  return data;
}

export async function updateRequestStatus(id, status) {
  const { data } = await axios.patch(`/requests/${id}/status`, { status });
  return data.request;
}

export async function startExtraction(id, lines) {
  const { data } = await axios.post(`/requests/${id}/extraction-jobs`, { lines });
  return data;
}

export async function fetchStaging(id) {
  const { data } = await axios.get(`/requests/${id}/staging`);
  return data.jobs;
}

export async function updateStagingItem(id, payload) {
  const { data } = await axios.patch(`/requests/staging-items/${id}`, payload);
  return data.item;
}

export async function promoteStaging(id) {
  const { data } = await axios.post(`/requests/${id}/promote-staging`);
  return data;
}

export const REQUEST_STATUS_LABELS = {
  draft: 'Taslak',
  review: 'İnceleme',
  approved: 'Onaylı',
  rejected: 'Reddedildi',
  converted: 'Dönüştürüldü'
};
