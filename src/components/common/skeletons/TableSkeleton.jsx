import React from 'react';
import { Box, Skeleton } from '@mui/material';

// TableSkeleton: DataGrid yüklenirken placeholder
export default function TableSkeleton({ rows=8, columns=5 }) {
  return (
    <Box sx={{ width:'100%', p:1 }}>
      <Box sx={{ display:'grid', gridTemplateColumns:`repeat(${columns}, 1fr)`, gap:0.5, mb:1 }}>
        {Array.from({ length: columns }).map((_,i)=>(
          <Skeleton key={i} variant="rounded" height={28} animation="wave" />
        ))}
      </Box>
      <Box sx={{ display:'flex', flexDirection:'column', gap:0.75 }}>
        {Array.from({ length: rows }).map((_,r)=>(
          <Box key={r} sx={{ display:'grid', gridTemplateColumns:`repeat(${columns}, 1fr)`, gap:0.5 }}>
            {Array.from({ length: columns }).map((__,c)=>(
              <Skeleton key={c} variant="rounded" height={32} animation="wave" />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
