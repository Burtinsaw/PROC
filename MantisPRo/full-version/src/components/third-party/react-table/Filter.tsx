// material-ui
import Stack from '@mui/material/Stack';

// third party
import { Column, RowData, Table } from '@tanstack/react-table';

// project imports
import DebouncedInput from './DebouncedInput';

// assets
import MinusOutlined from '@ant-design/icons/MinusOutlined';

interface NumberInputProps {
  columnFilterValue: [number, number];
  getFacetedMinMaxValues: () => [number, number] | undefined;

  setFilterValue: (updater: any) => void;
}

const filterStyle = { fontSize: 12, '& .MuiOutlinedInput-input': { p: 1 } };

// ==============================|| FILTER - NUMBER FIELD ||============================== //

function NumberInput({ columnFilterValue, getFacetedMinMaxValues, setFilterValue }: NumberInputProps) {
  const minOpt = getFacetedMinMaxValues()?.[0];
  const min = Number(minOpt ?? '');

  const maxOpt = getFacetedMinMaxValues()?.[1];
  const max = Number(maxOpt || 0);

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
      <DebouncedInput
        type="number"
        value={columnFilterValue?.[0] ?? ''}
        onFilterChange={(value) => setFilterValue((old: [number, number]) => [value, old?.[1]])}
        placeholder={`Min ${minOpt ? `(${min})` : ''}`}
        fullWidth
        slotProps={{ input: { min: min, max: max } }}
        startIcon={false}
        sx={filterStyle}
      />
      <MinusOutlined color="disabled" />
      <DebouncedInput
        type="number"
        value={columnFilterValue?.[1] ?? ''}
        onFilterChange={(value) => setFilterValue((old: [number, number]) => [old?.[0], value])}
        placeholder={`Max ${maxOpt ? `(${max})` : ''}`}
        fullWidth
        slotProps={{ input: { min: min, max: max } }}
        startIcon={false}
        sx={filterStyle}
      />
    </Stack>
  );
}

interface TextInputProps {
  columnId: string;
  columnFilterValue: string;
  setFilterValue: (updater: string | number) => void;
  header?: string;
}

// ==============================|| FILTER - TEXT FIELD ||============================== //

function TextInput({ columnId, columnFilterValue, header, setFilterValue }: TextInputProps) {
  const dataListId = columnId + 'list';

  return (
    <DebouncedInput
      type="text"
      fullWidth
      value={columnFilterValue ?? ''}
      onFilterChange={(value) => setFilterValue(value)}
      placeholder={`Search ${header}`}
      slotProps={{ input: { list: dataListId } }}
      startIcon={false}
      sx={filterStyle}
    />
  );
}

interface Props<T extends RowData> {
  column: Column<T, unknown>;
  table: Table<T>;
}

// ==============================|| FILTER - INPUT ||============================== //

export default function Filter<T extends RowData>({ column, table }: Props<T>) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === 'number' ? (
    <NumberInput
      columnFilterValue={columnFilterValue as [number, number]}
      getFacetedMinMaxValues={column.getFacetedMinMaxValues}
      setFilterValue={column.setFilterValue}
    />
  ) : (
    <TextInput
      columnId={column.id}
      columnFilterValue={columnFilterValue as string}
      setFilterValue={column.setFilterValue}
      header={column.columnDef.header as string}
    />
  );
}
