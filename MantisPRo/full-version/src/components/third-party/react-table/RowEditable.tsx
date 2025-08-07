import { useEffect, useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// third-party
import { useFormik } from 'formik';

// project imports
import { Column, Row, RowData, Table } from '@tanstack/react-table';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { TableDataProps } from 'types/table';

type RowEditProps<T extends RowData, V = string | number | undefined> = {
  getValue: () => V;
  row: Row<T>;
  column: Column<TableDataProps, unknown>;
  table: Table<T>;
};

// ==============================|| EDITABLE ROW ||============================== //

export default function RowEditable<T extends RowData>({
  getValue: initialValue,
  row,
  column: { id, columnDef },
  table
}: RowEditProps<T, string | number | undefined>) {
  const [value, setValue] = useState<string | number | undefined>(initialValue());
  const tableMeta = table.options.meta;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const ShowStatus = (value: string) => {
    switch (value) {
      case 'Complicated':
        return <Chip color="error" label="Complicated" size="small" variant="light" />;
      case 'Relationship':
        return <Chip color="success" label="Relationship" size="small" variant="light" />;
      case 'Single':
      default:
        return <Chip color="info" label="Single" size="small" variant="light" />;
    }
  };

  const formik = useFormik({
    initialValues: { userInfo: value },
    validationSchema: undefined, // You may want to build a Yup schema dynamically if needed
    enableReinitialize: true,
    onSubmit: () => {
      if (!Object.keys(formik.errors).length) {
        // @ts-expect-error: meta may be undefined in some cases, so we bypass TypeScript's strict check
        tableMeta!.updateData(row.index, id, formik.values.userInfo);
      }
    }
  });
  const { values, errors, handleChange, handleSubmit } = formik;

  // @ts-expect-error: meta may be undefined in some cases, so we bypass TypeScript's strict check
  const isEditable = tableMeta?.selectedRow[row.id];

  const onBlur = () => {
    handleSubmit();
  };

  let element;

  // @ts-expect-error: columnDef may not always have a `dataType` property
  switch (columnDef.dataType) {
    case 'text':
      element = isEditable ? (
        <form onSubmit={handleSubmit}>
          <TextField
            name="userInfo"
            value={values.userInfo}
            onChange={(e) => {
              handleChange(e);
              setValue(e.target.value);
            }}
            onBlur={onBlur}
            error={Boolean(errors.userInfo)}
            helperText={errors.userInfo}
            size="small"
            sx={{ '& .MuiFormHelperText-root': { mx: 0 } }}
          />
        </form>
      ) : (
        value
      );
      break;
    case 'select':
      element = isEditable ? (
        <Select
          name="userInfo"
          value={values.userInfo}
          onChange={(e) => {
            handleChange(e);
            setValue(e.target.value);
          }}
          size="small"
          onBlur={onBlur}
        >
          <MenuItem value="Complicated">
            <Chip color="error" label="Complicated" size="small" variant="light" />
          </MenuItem>
          <MenuItem value="Relationship">
            <Chip color="success" label="Relationship" size="small" variant="light" />
          </MenuItem>
          <MenuItem value="Single">
            <Chip color="info" label="Single" size="small" variant="light" />
          </MenuItem>
        </Select>
      ) : (
        ShowStatus(value as string)
      );
      break;
    case 'progress':
      element = isEditable ? (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', pl: 1, minWidth: 120 }}>
          <Slider
            value={values.userInfo as number}
            min={0}
            max={100}
            step={1}
            onBlur={onBlur}
            onChange={(_, newValue) => {
              setValue(newValue as number);
              formik.setFieldValue('userInfo', newValue);
            }}
            valueLabelDisplay="auto"
            aria-labelledby="non-linear-slider"
          />
        </Stack>
      ) : (
        <LinearWithLabel value={value as number} sx={{ minWidth: 75 }} />
      );
      break;
    default:
      element = <span></span>;
      break;
  }

  return element;
}
