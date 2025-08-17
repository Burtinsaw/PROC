import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function ShipmentsGrid({ rows, columns, selectedIds = [], onSelectionChange }) {
  const navigate = useNavigate();
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pageSizeOptions={[10, 25]}
      initialState={{
        pagination: { paginationModel: { pageSize: 10 } },
        sorting: { sortModel: [{ field: 'openExceptions', sort: 'desc' }] }
      }}
      density="compact"
  checkboxSelection
  disableRowSelectionOnClick
  rowSelectionModel={selectedIds}
  onRowSelectionModelChange={(model)=> onSelectionChange && onSelectionChange(model)}
  onRowDoubleClick={(params)=> navigate(`/shipments/${params.id}`)}
  slots={{ toolbar: GridToolbar }}
      sx={(theme) => ({
        border: '1px solid',
        borderColor: theme.palette.divider,
        borderRadius: 2,
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
