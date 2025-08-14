import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listInbox, seedInbox } from '../api/email';

const COMPANY_COLORS = {
  BN: '#1f77b4', YN: '#ff7f0e', AL: '#2ca02c', TG: '#d62728', OT: '#9467bd', NZ: '#8c564b'
};

function CompanyBadge({ code }){
  const color = COMPANY_COLORS[code] || '#6b7280';
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', fontSize:12,
      padding:'2px 8px', borderRadius:999, backgroundColor: color + '22', color,
      border: `1px solid ${color}66`, marginRight:8
    }}>{code}</span>
  );
}

export default function EmailInbox(){
  const [q, setQ] = useState('');
  const [companies, setCompanies] = useState([]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['email-inbox', q, companies.join(',')],
    queryFn: ()=>listInbox({ limit:50, q, companies })
  });

  const items = data?.items || [];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:12 }}>
        <input
          placeholder="Ara (konu/içerik)"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{ padding:8, border:'1px solid #ddd', borderRadius:6, minWidth:220 }}
        />
        <select multiple value={companies} onChange={e=>setCompanies(Array.from(e.target.selectedOptions).map(o=>o.value))}
          style={{ padding:8, border:'1px solid #ddd', borderRadius:6 }}>
          {Object.keys(COMPANY_COLORS).map(c=> (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button onClick={()=>refetch()} disabled={isFetching} style={{ padding:'8px 12px' }}>Yenile</button>
  {import.meta?.env?.MODE !== 'production' && (
          <button onClick={async ()=>{ await seedInbox(); refetch(); }} style={{ padding:'8px 12px' }}>Mock Doldur</button>
        )}
      </div>
      {isLoading ? <div>Yükleniyor...</div> : (
        <div style={{ border:'1px solid #e5e7eb', borderRadius:8 }}>
          {items.map((m)=> (
            <div key={m.id || m.messageId} style={{
              display:'flex', gap:12, padding:'10px 12px', borderBottom:'1px solid #f1f5f9',
              background: m.unread ? '#f8fafc' : 'white'
            }}>
              <CompanyBadge code={m.companyCode} />
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                  <strong style={{ color:'#111827' }}>{m.subject || '(No subject)'}</strong>
                  <span style={{ color:'#6b7280', fontSize:12 }}>{m.date ? new Date(m.date).toLocaleString() : ''}</span>
                </div>
                <div style={{ color:'#374151', fontSize:13, marginTop:4 }}>{m.snippet || m.bodyText?.slice(0,140)}</div>
                <div style={{ color:'#6b7280', fontSize:12, marginTop:2 }}>From: {m.from}</div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding:16, color:'#6b7280' }}>Kayıt bulunamadı.</div>
          )}
        </div>
      )}
    </div>
  );
}
