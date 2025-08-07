import { useEffect, useMemo, useState } from 'react';

// material-ui
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

// third party
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import MainCard from 'components/MainCard';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport, RowSelection, TablePagination } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';

// ==============================|| REACT TABLE - ROW SELECTION ||============================== //

function ReactTable({ data, columns }: { data: TableDataProps[]; columns: ColumnDef<TableDataProps>[] }) {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });

  useEffect(() => setRowSelection({ 5: true }), []);

  const headers: LabelKeyObject[] = [];

  columns.forEach((column) => {
    const accessorKey = (column as { accessorKey?: string }).accessorKey;

    if (accessorKey) {
      headers.push({
        label: typeof column.header === 'string' ? column.header : '#',
        key: accessorKey ?? ''
      });
    }
  });

  return (
    <MainCard
      title="Row Selection"
      content={false}
      secondary={
        <Stack sx={{ alignItems: 'flex-end' }}>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <CSVExport
            {...{
              data:
                table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                  ? data
                  : table.getSelectedRowModel().flatRows.map((row) => row.original),
              headers,
              filename: 'row-selection.csv'
            }}
          />
        </Stack>
      }
      codeString={JSON.stringify(
        { rowSelection: rowSelection, 'flatRows[].original': table.getSelectedRowModel().flatRows.map((row) => row.original) },
        null,
        2
      )}
      codeHighlight
    >
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <Box sx={{ p: 2 }}>
        <TablePagination
          {...{
            setPageSize: table.setPageSize,
            setPageIndex: table.setPageIndex,
            getState: table.getState,
            getPageCount: table.getPageCount
          }}
        />
      </Box>
    </MainCard>
  );
}

// ==============================|| ROW SELECTION ||============================== //

export default function RowSelectionTable() {
  const data: TableDataProps[] = makeData(100);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
        ),
        meta: { sx: { width: 58 } }
      },
      { header: 'Name', accessorKey: 'fullName', meta: { sx: { whiteSpace: 'nowrap' } } },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Age', accessorKey: 'age', meta: { sx: { textAlign: 'right' } } },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: (cell) => {
          switch (cell.getValue()) {
            case 'Complicated':
              return <Chip color="error" label="Complicated" size="small" variant="light" />;
            case 'Relationship':
              return <Chip color="success" label="Relationship" size="small" variant="light" />;
            case 'Single':
            default:
              return <Chip color="info" label="Single" size="small" variant="light" />;
          }
        }
      },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      }
    ],
    []
  );

  return <ReactTable {...{ data, columns }} />;
}
