import axios from '../utils/axios';

export async function listCompanyUsers() {
  const { data } = await axios.get('/messages/users');
  return data;
}

export async function getInbox() {
  const { data } = await axios.get('/messages/inbox');
  return data;
}

export async function getChatWith(userId) {
  const { data } = await axios.get(`/messages/chat/${userId}`);
  return data;
}

export async function getGroupChat(groupId) {
  const { data } = await axios.get(`/messages/group/${groupId}`);
  return data;
}

export async function sendText({ receiverId, groupId, content }) {
  const { data } = await axios.post('/messages/send', { receiverId, groupId, content });
  return data;
}

export async function sendFile({ receiverId, groupId, file }) {
  const form = new FormData();
  if (receiverId) form.append('receiverId', receiverId);
  if (groupId) form.append('groupId', groupId);
  form.append('file', file);
  const { data } = await axios.post('/messages/send-file', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function listGroups() {
  const { data } = await axios.get('/messages/groups');
  return data;
}

export async function createGroup({ name, memberIds }) {
  const { data } = await axios.post('/messages/groups', { name, memberIds });
  return data.group;
}

export async function getPresence() {
  const { data } = await axios.get('/messages/presence');
  return data;
}

export async function getUnreadCount() {
  const { data } = await axios.get('/messages/unread-count');
  return data?.count ?? 0;
}

// Admin APIs
export async function adminListConversations(){
  const { data } = await axios.get('/messages/admin/conversations');
  return data;
}

export async function adminGetChat(u1, u2){
  const { data } = await axios.get('/messages/admin/chat', { params: { u1, u2 } });
  return data;
}

export async function adminEditMessage(id, content){
  const { data } = await axios.patch(`/messages/${id}`, { content });
  return data;
}

export async function adminDeleteMessage(id){
  const { data } = await axios.delete(`/messages/${id}`);
  return data;
}
