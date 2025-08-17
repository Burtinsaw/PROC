import axios from '../utils/axios';

export async function talepExtractFromText(talepId, text){
  const { data } = await axios.post(`/talepler/${encodeURIComponent(talepId)}/extract-staging`, { text });
  return data; // { ok, jobId, count, items }
}

export async function talepExtractFromFiles(talepId, files){
  const form = new FormData();
  for(const f of files) form.append('files', f);
  const { data } = await axios.post(`/talepler/${encodeURIComponent(talepId)}/extract-staging`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data; // { ok, jobId, count, items }
}

export async function talepGetStaging(talepId, jobId){
  const url = jobId ? `/talepler/${encodeURIComponent(talepId)}/extract-staging?jobId=${encodeURIComponent(jobId)}` : `/talepler/${encodeURIComponent(talepId)}/extract-staging`;
  const { data } = await axios.get(url);
  return data; // { ok, jobId, count, items }
}

export async function talepCommitStaging(talepId, jobId, itemIds){
  const body = { jobId };
  if(Array.isArray(itemIds) && itemIds.length) body.itemIds = itemIds;
  const { data } = await axios.post(`/talepler/${encodeURIComponent(talepId)}/extract-staging/commit`, body);
  return data; // { ok, committed }
}
