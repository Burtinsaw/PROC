import axios from '../utils/axios';

export async function listInbox({ limit = 50, offset = 0, q, companies, folder, flagged, unread } = {}, config = {}){
  const params = {};
  if(limit) params.limit = limit;
  if(offset) params.offset = offset;
  if(q) params.q = q;
  if(companies && companies.length) params.companies = companies.join(',');
  if(folder) params.folder = folder;
  if(typeof flagged === 'boolean') params.flagged = flagged;
  if(typeof unread === 'boolean') params.unread = unread;
  const { data } = await axios.get('/email/inbox', { params, ...(config||{}) });
  return data;
}

export async function seedInbox(){
  const { data } = await axios.post('/email/inbox/seed');
  return data;
}

// Accounts API
export async function listAccounts(){
  const { data } = await axios.get('/email/accounts');
  return data;
}

export async function createAccount(payload){
  const { data } = await axios.post('/email/accounts', payload);
  return data;
}

export async function updateAccount(id, payload){
  const { data } = await axios.put(`/email/accounts/${id}`, payload);
  return data;
}

export async function deleteAccount(id){
  const { data } = await axios.delete(`/email/accounts/${id}`);
  return data;
}

export async function imapSyncNow(){
  const { data } = await axios.post('/email/imap/sync-now');
  return data;
}

export async function updateMessageFlags(id, payload){
  const { data } = await axios.patch(`/email/message/${id}/flags`, payload);
  return data;
}

export async function moveMessage(id, folder){
  const { data } = await axios.post(`/email/message/${id}/move`, { folder });
  return data;
}

export async function markSpam(id){
  const { data } = await axios.post(`/email/message/${id}/mark-spam`);
  return data;
}

export async function markHam(id){
  const { data } = await axios.post(`/email/message/${id}/mark-ham`);
  return data;
}

export async function getCounts(){
  const { data } = await axios.get('/email/counts');
  return data?.counts || { spam:0, spamUnread:0, trash:0, inboxUnread:0 };
}

// Rules API
export async function listRules(){
  const { data } = await axios.get('/email/rules');
  return data;
}

export async function createRule(payload){
  const { data } = await axios.post('/email/rules', payload);
  return data;
}

export async function updateRule(id, payload){
  const { data } = await axios.put(`/email/rules/${id}`, payload);
  return data;
}

export async function deleteRule(id){
  const { data } = await axios.delete(`/email/rules/${id}`);
  return data;
}

export async function applyRule(id, limit){
  const { data } = await axios.post(`/email/rules/${id}/apply`, { limit });
  return data;
}

// Drafts & Compose API
export async function upsertDraft(payload){
  const { data } = await axios.post('/email/drafts', payload);
  return data;
}
export async function listDrafts(){
  const { data } = await axios.get('/email/drafts');
  return data;
}
export async function getDraft(id){
  const { data } = await axios.get(`/email/drafts/${id}`);
  return data;
}
export async function deleteDraft(id){
  const { data } = await axios.delete(`/email/drafts/${id}`);
  return data;
}
export async function lockDraft(id){
  const { data } = await axios.post(`/email/drafts/${id}/lock`);
  return data;
}
export async function unlockDraft(id){
  const { data } = await axios.post(`/email/drafts/${id}/unlock`);
  return data;
}
export async function uploadDraftAttachment(id, file){
  const form = new FormData();
  form.append('file', file);
  const { data } = await axios.post(`/email/drafts/${id}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}
export async function listDraftAttachments(id){
  const { data } = await axios.get(`/email/drafts/${id}/attachments`);
  return data;
}
export async function deleteDraftAttachment(id, path){
  const { data } = await axios.delete(`/email/drafts/${id}/attachments`, { data: { path } });
  return data;
}
export async function joinDraftPresence(id){
  const { data } = await axios.post(`/email/drafts/${id}/presence/join`);
  return data;
}
export async function leaveDraftPresence(id){
  const { data } = await axios.post(`/email/drafts/${id}/presence/leave`);
  return data;
}
export async function getDraftPresence(id){
  const { data } = await axios.get(`/email/drafts/${id}/presence`);
  return data;
}
export async function patchDraft(id, updates){
  const { data } = await axios.post(`/email/drafts/${id}/patch`, updates);
  return data;
}
export async function sendNow({ draftId, to, cc, bcc, subject, bodyHtml, bodyText, attachments, accountId, link }){
  const { data } = await axios.post('/email/send', { draftId, to, cc, bcc, subject, bodyHtml, bodyText, attachments, accountId, link });
  return data;
}
export async function scheduleSend({ draftId, scheduledAt }){
  const { data } = await axios.post('/email/schedule', { draftId, scheduledAt });
  return data;
}
export async function cancelSchedule(id){
  const { data } = await axios.post(`/email/schedule/${id}/cancel`);
  return data;
}

// Signatures API
export async function listSignatures(params){
  const { data } = await axios.get('/email/signatures', { params });
  return data;
}
// Contacts (adres defteri)
export async function suggestContacts(q){
  const { data } = await axios.get(`/contacts/suggest?q=${encodeURIComponent(q||'')}`);
  return data?.items || [];
}
export async function importContactsCsv(file){
  const form = new FormData(); form.append('file', file);
  const { data } = await axios.post('/contacts/import', form, { headers: { 'Content-Type':'multipart/form-data' } });
  return data;
}
export async function harvestContacts(accountIds){
  const { data } = await axios.post(`/contacts/harvest`, { accountIds }, { headers: { 'X-Suppress-Error-Toast': '1' }, _suppressErrorToast: true });
  return data;
}
export async function createSignature(payload){
  const { data } = await axios.post('/email/signatures', payload);
  return data;
}
export async function updateSignature(id, payload){
  const { data } = await axios.put(`/email/signatures/${id}`, payload);
  return data;
}
export async function deleteSignature(id){
  const { data } = await axios.delete(`/email/signatures/${id}`);
  return data;
}
export async function uploadSignatureFile(file){
  const form = new FormData();
  form.append('file', file);
  const { data } = await axios.post('/email/signatures/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}

// Auto-Reply API
export async function getAutoReply(){
  const { data } = await axios.get('/email/auto-reply');
  return data?.item || { enabled:false };
}
export async function updateAutoReply(payload){
  const { data } = await axios.put('/email/auto-reply', payload);
  return data?.item || null;
}
export async function listAutoReplyLogs({ cursor, sender, limit = 50 } = {}){
  const params = {};
  if (cursor) params.cursor = cursor;
  if (sender) params.sender = sender;
  if (limit) params.limit = limit;
  const { data } = await axios.get('/email/auto-reply/logs', { params });
  return {
    items: data?.items || [],
    nextCursor: data?.nextCursor || null
  };
}

// Templates API
export async function listTemplates(){
  const { data } = await axios.get('/email/templates');
  return data?.items || [];
}
export async function getTemplate(id){
  const { data } = await axios.get(`/email/templates/${id}`);
  return data?.item || null;
}
export async function createTemplate(payload){
  const { data } = await axios.post('/email/templates', payload);
  return data?.item || null;
}
export async function updateTemplate(id, payload){
  const { data } = await axios.put(`/email/templates/${id}`, payload);
  return data?.item || null;
}
export async function deleteTemplate(id){
  const { data } = await axios.delete(`/email/templates/${id}`);
  return data?.success;
}
