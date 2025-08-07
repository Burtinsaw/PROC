import { CSSProperties, Fragment, ReactNode, useEffect, useMemo, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

// third party
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { compareItems, rankItem, RankingInfo } from '@tanstack/match-sorter-utils';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  useReactTable,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  GroupingState,
  FilterFn,
  SortingFn,
  sortingFns,
  Header,
  Row
} from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import {
  CSVExport,
  DebouncedInput,
  EmptyTable,
  EditRow,
  Filter,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination,
  RowEditable,
  SelectColumnVisibility
} from 'components/third-party/react-table';

import makeData from 'data/react-table';
import ExpandingUserDetail from 'sections/tables/react-table/ExpandingUserDetail';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// types
import { TableDataProps } from 'types/table';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';
import DragOutlined from '@ant-design/icons/DragOutlined';
import GroupOutlined from '@ant-design/icons/GroupOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import UngroupOutlined from '@ant-design/icons/UngroupOutlined';

const fuzzyFilter: FilterFn<TableDataProps> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

const fuzzySort: SortingFn<TableDataProps> = (rowA, rowB, columnId) => {
  let dir = 0;

  // only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(rowA.columnFiltersMeta[columnId]! as RankingInfo, rowB.columnFiltersMeta[columnId]! as RankingInfo);
  }

  // provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

const nonOrderableColumnId: UniqueIdentifier[] = ['drag-handle', 'expander', 'select'];

// ==============================|| REACT TABLE - DRAGGABLE HEADER ||============================== //

function DraggableTableHeader({ header }: { header: Header<TableDataProps, unknown> }) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: header.column.id
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0
  };

  return (
    <TableCell colSpan={header.colSpan} ref={setNodeRef} style={style}>
      {header.isPlaceholder ? null : (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          {header.column.getCanGroup() && (
            <IconButton
              color={header.column.getIsGrouped() ? 'error' : 'primary'}
              onClick={header.column.getToggleGroupingHandler()}
              size="small"
              sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
            >
              {header.column.getIsGrouped() ? <UngroupOutlined /> : <GroupOutlined />}
            </IconButton>
          )}
          <Box {...(!nonOrderableColumnId.includes(header.id) && { ...attributes, ...listeners, sx: { cursor: 'move' } })}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </Box>
          {header.column.getCanSort() && <HeaderSort column={header.column} sort />}
        </Stack>
      )}
    </TableCell>
  );
}

// ==============================|| REACT TABLE - DRAGGABLE ROW ||============================== //

function DraggableRow({ children, row }: { children: ReactNode; row: Row<TableDataProps> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({ id: row.original.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative'
  };

  return (
    <TableRow ref={setNodeRef} sx={style}>
      {children}
    </TableRow>
  );
}

// ==============================|| REACT TABLE - DRAGGABLE HANDLE ||============================== //

function RowDragHandleCell({ rowId }: { rowId: string }) {
  const { attributes, listeners, setNodeRef: setDragRef } = useSortable({ id: rowId });

  return (
    <IconButton
      ref={setDragRef}
      {...attributes}
      {...listeners}
      size="small"
      sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
      color="secondary"
    >
      <DragOutlined />
    </IconButton>
  );
}

// ==============================|| REACT TABLE - UMBRELLA ||============================== //

export default function UmbrellaTable() {
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  const columns = useMemo<ColumnDef<TableDataProps, unknown>[]>(
    () => [
      { id: 'drag-handle', header: () => null, cell: ({ row }) => <RowDragHandleCell rowId={row.id} />, size: 60 },
      {
        id: 'expander',
        enableGrouping: false,
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton color={row.getIsExpanded() ? 'primary' : 'secondary'} onClick={row.getToggleExpandedHandler()} size="small">
              {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
            </IconButton>
          ) : (
            <IconButton color="secondary" size="small" disabled>
              <StopOutlined />
            </IconButton>
          );
        },
        size: 60
      },
      {
        id: 'select',
        enableGrouping: false,
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        ),
        size: 60
      },
      {
        id: 'id',
        title: 'Id',
        header: '#',
        accessorKey: 'id',
        dataType: 'text',
        enableColumnFilter: false,
        enableGrouping: false,
        meta: { sx: { textAlign: 'center' } }
      },
      {
        id: 'avatar',
        header: 'Avatar',
        accessorKey: 'avatar',
        enableColumnFilter: false,
        enableGrouping: false,
        cell: (cell) => (
          <Avatar alt="Avatar 1" size="sm" src={getImageUrl(`avatar-${cell.getValue()}.png`, ImagePath.USERS)} sx={{ m: 'auto' }} />
        ),
        meta: { sx: { textAlign: 'center' } }
      },
      { id: 'fullName', header: 'Name', footer: 'Name', accessorKey: 'fullName', dataType: 'text', enableGrouping: false },
      { id: 'email', header: 'Email', footer: 'Email', accessorKey: 'email', dataType: 'text', enableGrouping: false },
      {
        id: 'age',
        header: 'Age',
        footer: 'Age',
        accessorKey: 'age',
        dataType: 'text',
        meta: { sx: { textAlign: 'right' } },
        enableGrouping: true
      },
      {
        id: 'role',
        header: 'Role',
        footer: 'Role',
        accessorKey: 'role',
        dataType: 'text',
        enableGrouping: true,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort
      },
      { id: 'contact', header: 'Contact', footer: 'Contact', accessorKey: 'contact', dataType: 'text', enableGrouping: false },
      { id: 'country', header: 'Country', footer: 'Country', accessorKey: 'country', dataType: 'text', enableGrouping: false },
      {
        id: 'visits',
        header: 'Visits',
        footer: 'Visits',
        accessorKey: 'visits',
        dataType: 'text',
        enableGrouping: false,
        meta: { sx: { textAlign: 'right' } }
      },
      { id: 'status', header: 'Status', footer: 'Status', accessorKey: 'status', dataType: 'select', enableGrouping: true },
      {
        id: 'progress',
        header: 'Profile Progress',
        footer: 'Profile Progress',
        accessorKey: 'progress',
        dataType: 'progress',
        enableGrouping: false
      },
      {
        id: 'actions',
        header: 'Actions',
        dataType: 'actions',
        meta: { sx: { textAlign: 'center' } }
      }
    ],
    []
  );

  const [data, setData] = useState(() => makeData(100));
  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map((c) => c.id!));
  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }: TableDataProps) => id), [data]);

  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);

  const [columnVisibility, setColumnVisibility] = useState({});

  const [originalData, setOriginalData] = useState(() => [...data]);
  const [selectedRow, setSelectedRow] = useState({});

  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((user: TableDataProps) => user.status === statusFilter);
  }, [statusFilter, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    defaultColumn: { cell: RowEditable as ColumnDef<TableDataProps, unknown>['cell'] },
    getRowId: (row) => row.id,
    state: { rowSelection, columnFilters, globalFilter, sorting, grouping, columnOrder, columnVisibility },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
    meta: {
      selectedRow,
      setSelectedRow,
      revertData: (rowIndex: number, revert: unknown) => {
        if (revert) {
          setData((old: TableDataProps[]) => old.map((row, index) => (index === rowIndex ? originalData[rowIndex] : row)));
        } else {
          setOriginalData((old) => old.map((row, index) => (index === rowIndex ? data[rowIndex] : row)));
        }
      },
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        setData((old: TableDataProps[]) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return { ...old[rowIndex]!, [columnId]: value };
            }
            return row;
          })
        );
      }
    }
  });

  const headers: LabelKeyObject[] = [];
  table.getVisibleLeafColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });

  // Handle Column Drag End
  function handleColumnDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      if (nonOrderableColumnId.includes(over.id)) return;
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  // Handle Row Drag End
  function handleRowDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data: unknown[]) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const columnSensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));
  const rowSensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  const filteredColumns = table.getAllColumns().filter((col) => !nonOrderableColumnId.includes(col.id));

  useEffect(() => setColumnVisibility({ id: false, role: false, contact: false, country: false, progress: false }), []);

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          gap: 2,
          p: 2,
          justifyContent: 'space-between',
          ...(downSM && { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: 1 } })
        }}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: 'center', gap: 2, width: { xs: 1, sm: 'auto' } }}>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            displayEmpty
            size="small"
            input={<OutlinedInput />}
            slotProps={{ input: { 'aria-label': 'Status Filter' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Single">Single</MenuItem>
            <MenuItem value="Relationship">Relationship</MenuItem>
            <MenuItem value="Complicated">Complicated</MenuItem>
          </Select>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <RowSelection selected={Object.keys(rowSelection).length} />
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center', width: { xs: 1, sm: 'auto' } }}>
              <SelectColumnVisibility
                {...{
                  getVisibleLeafColumns: () => table.getVisibleLeafColumns().filter((col) => !nonOrderableColumnId.includes(col.id)),
                  getIsAllColumnsVisible: () => filteredColumns.every((col) => col.getIsVisible?.()),
                  getToggleAllColumnsVisibilityHandler: table.getToggleAllColumnsVisibilityHandler,
                  getAllColumns: () => filteredColumns
                }}
              />
              <CSVExport
                {...{
                  data:
                    table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                      ? data
                      : table.getSelectedRowModel().flatRows.map((row) => row.original),
                  headers,
                  filename: 'umbrella.csv'
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Column DnD Context */}
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleColumnDragEnd}
        sensors={columnSensors}
      >
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader key={header.id} header={header} />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHead>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                      {header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {/* Row DnD Context */}
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleRowDragEnd}
                sensors={rowSensors}
              >
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => {
                    if (row.getIsGrouped()) {
                      return (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => {
                            const bgcolor = cell.getIsGrouped()
                              ? theme.palette.primary.lighter
                              : cell.getIsAggregated()
                                ? theme.palette.warning.lighter
                                : cell.getIsPlaceholder()
                                  ? theme.palette.error.lighter
                                  : theme.palette.background.paper;
                            return (
                              <TableCell key={cell.id} {...cell.column.columnDef.meta} style={{ background: bgcolor }}>
                                {cell.getIsGrouped() ? (
                                  // Only show value for the grouped column, empty for others
                                  row.groupingColumnId === cell.column.id ? (
                                    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                                      <IconButton
                                        onClick={row.getToggleExpandedHandler()}
                                        size="small"
                                        sx={{ p: 0, width: 24, height: 24 }}
                                      >
                                        {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
                                      </IconButton>
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}&nbsp;({row.subRows.length})
                                    </Stack>
                                  ) : null
                                ) : cell.getIsAggregated() ? (
                                  flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                                ) : cell.getIsPlaceholder() ? null : (
                                  flexRender(cell.column.columnDef.cell, cell.getContext())
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    } else {
                      return (
                        <Fragment key={row.id}>
                          <DraggableRow row={row}>
                            <EditRow
                              row={row}
                              onSave={(updatedData) => {
                                setData((prev: TableDataProps[]) =>
                                  prev.map((item: TableDataProps) => (item.id === row.original.id ? { ...item, ...updatedData } : item))
                                );
                              }}
                              grouping={table.getState().grouping}
                            />
                          </DraggableRow>
                          {row.getIsExpanded() && (
                            <TableRow key={`${row.id}-expanded`}>
                              <TableCell colSpan={table.getAllLeafColumns().length} sx={{ bgcolor: 'background.default', p: 3 }}>
                                <ExpandingUserDetail data={row.original} />
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    }
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length}>
                      <EmptyTable msg="No Data" />
                    </TableCell>
                  </TableRow>
                )}
              </DndContext>
            </TableBody>
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => (
                    <TableCell key={footer.id} {...footer.column.columnDef.meta}>
                      {footer.isPlaceholder ? null : flexRender(footer.column.columnDef.header, footer.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </TableContainer>
      </DndContext>
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
