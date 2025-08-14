import axios from '../utils/axios';

export const listUsers = async () => {
  const { data } = await axios.get('/admin/users');
  return data?.users || data?.data || [];
};

export const getUser = async (id) => {
  const { data } = await axios.get(`/admin/users/${id}`);
  return data?.user || data;
};

export const createUser = async (payload) => {
  const { data } = await axios.post('/admin/users', payload);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await axios.put(`/admin/users/${id}`, payload);
  return data?.user || data;
};

export const updateStatus = async (id, status) => {
  const { data } = await axios.patch(`/admin/users/${id}/status`, { status });
  return data?.user || data;
};

export const resetPassword = async (id) => {
  const { data } = await axios.post(`/admin/users/${id}/reset-password`);
  return data; // { success, tempPassword, userId }
};

export const deleteUser = async (id) => {
  const { data } = await axios.delete(`/admin/users/${id}`);
  return data;
};
