import api from './api';

export async function listCompanies(params = {}) {
	const search = new URLSearchParams();
	if (params.q) search.set('q', params.q);
	if (params.type) search.set('type', params.type);
	if (params.types) search.set('types', Array.isArray(params.types) ? params.types.join(',') : params.types);
	const { data } = await api.get(`/companies${search.toString() ? `?${search.toString()}` : ''}`);
	return data;
}

export async function getCompany(id) {
	const { data } = await api.get(`/companies/${id}`);
	return data;
}

export async function createCompany(payload) {
	const { data } = await api.post('/companies', payload);
	return data;
}

export async function updateCompany(id, payload) {
	const { data } = await api.put(`/companies/${id}` , payload);
	return data;
}

export async function deleteCompany(id) {
	const { data } = await api.delete(`/companies/${id}`);
	return data;
}

export async function importCompanies(companies) {
	const payload = Array.isArray(companies) ? { companies } : companies;
	const { data } = await api.post('/companies/import', payload);
	return data;
}

export async function exportCompanies(params = {}) {
	const search = new URLSearchParams();
	if (params.q) search.set('q', params.q);
	if (params.type) search.set('type', params.type);
	if (params.types) search.set('types', Array.isArray(params.types) ? params.types.join(',') : params.types);
	const url = `/companies/export${search.toString() ? `?${search.toString()}` : ''}`;
	const { data } = await api.get(url);
	return data;
}

export async function previewMergeCompanies(sourceId, targetId) {
	const { data } = await api.post('/companies/merge/preview', { sourceId, targetId });
	return data;
}

export async function mergeCompanies(sourceId, targetId) {
	const { data } = await api.post('/companies/merge', { sourceId, targetId });
	return data;
}

export default {
	listCompanies,
	getCompany,
	createCompany,
	updateCompany,
	deleteCompany,
	importCompanies,
	exportCompanies,
	previewMergeCompanies,
	mergeCompanies,
};
