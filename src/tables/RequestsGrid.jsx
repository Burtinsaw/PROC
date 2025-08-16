import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

export default function RequestsGrid({ rows, columns, selectionModel, setSelectionModel, onRowClick }) {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      checkboxSelection
      rowSelectionModel={selectionModel}
      onRowSelectionModelChange={(m) => setSelectionModel(m)}
      disableRowSelectionOnClick
      onRowClick={onRowClick}
      pageSizeOptions={[10, 25, 50]}
      initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      density="compact"
      sx={(theme) => ({
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 12,
        '& .MuiDataGrid-columnHeaders': { fontWeight: 600 },
        '& .MuiDataGrid-row:nth-of-type(even)': {
          backgroundColor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.02)'
              : 'rgba(0,0,0,0.02)'
        },
        '& .MuiDataGrid-row.Mui-selected': {
          backgroundColor: theme.palette.action.selected,
          '&:hover': { backgroundColor: theme.palette.action.selected }
        },
        '& .MuiDataGrid-cell': { outline: 'none !important' }
      })}
    />
  );
}
