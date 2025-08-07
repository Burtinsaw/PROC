import { ChangeEvent, useEffect, useState } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third party
import { TableState, Updater } from '@tanstack/react-table';

interface TablePaginationProps {
  setPageSize: (updater: Updater<number>) => void;
  setPageIndex: (updater: Updater<number>) => void;
  getState: () => TableState;
  getPageCount: () => number;
  initialPageSize?: number;
}

// ==============================|| TABLE PAGINATION ||============================== //

export default function TablePagination({ getPageCount, setPageIndex, setPageSize, getState, initialPageSize }: TablePaginationProps) {
  const downSM = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const [open, setOpen] = useState(false);
  let options: number[] = [10, 25, 50, 100];

  if (initialPageSize) {
    options = [...options, initialPageSize]
      .filter((item, index) => [...options, initialPageSize].indexOf(item) === index)
      .sort(function (a, b) {
        return a - b;
      });
  }

  // eslint-disable-next-line
  useEffect(() => setPageSize(initialPageSize || 10), []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChangePagination = (event: ChangeEvent<unknown>, value: number) => {
    setPageIndex(value - 1);
  };

  const handleChange = (event: SelectChangeEvent<number>) => {
    setPageSize(Number(event.target.value));
  };

  return (
    <Stack direction="row" sx={{ gap: 2, justifyContent: 'space-between', alignItems: 'center', width: 'auto', flexWrap: 'wrap' }}>
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
        <Typography variant="caption" color="secondary">
          Row per page
        </Typography>
        <Select
          id="pagination-select"
          open={open}
          onClose={handleClose}
          onOpen={handleOpen}
          value={getState().pagination.pageSize}
          onChange={handleChange}
          size="small"
          slotProps={{ input: { sx: { py: 0.75, px: 1.25 } } }}
        >
          {options.map((option: number) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="secondary">
          Go to
        </Typography>
        <TextField
          size="small"
          type="number"
          value={getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            setPageIndex(page);
          }}
          slotProps={{ htmlInput: { sx: { py: 0.75, px: 1.25, width: 36 } } }}
        />
      </Stack>
      <Pagination
        sx={{ my: 0.5 }}
        count={getPageCount()}
        page={getState().pagination.pageIndex + 1}
        onChange={handleChangePagination}
        color="primary"
        variant="combined"
        showFirstButton={!downSM}
        showLastButton={!downSM}
        size={downSM ? 'small' : 'medium'}
      />
    </Stack>
  );
}
