import { ReactNode, useRef, useState } from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { useFormik } from 'formik';
import * as Yup from 'yup';

// project imports
import { Row } from '@tanstack/react-table';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import Avatar from 'components/@extended/Avatar';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';
import { flexRender } from '@tanstack/react-table';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import EditTwoTone from '@ant-design/icons/EditTwoTone';
import SendOutlined from '@ant-design/icons/SendOutlined';

interface EditRowProps<TData> {
  row: Row<TData>;
  onSave: (updatedData: Record<string, unknown>) => void;
  grouping?: string[];
}

function ShowStatus(value: string) {
  switch (value) {
    case 'Complicated':
      return <Chip color="error" label="Complicated" size="small" variant="light" />;
    case 'Relationship':
      return <Chip color="success" label="Relationship" size="small" variant="light" />;
    case 'Single':
    default:
      return <Chip color="info" label="Single" size="small" variant="light" />;
  }
}

function getYupSchemaForRow<TData>(row: Row<TData>) {
  const shape: Record<string, any> = {};
  const skipValidation = ['drag-handle', 'expander', 'select', 'actions'];
  row.getVisibleCells().forEach((cell) => {
    const columnId = cell.column.id;
    if (skipValidation.includes(columnId)) {
      return;
    }
    switch (columnId) {
      case 'fullName':
        shape[columnId] = Yup.string().required('Name is required');
        break;
      case 'email':
        shape[columnId] = Yup.string().email('Invalid email').required('Email is required');
        break;
      case 'age':
        shape[columnId] = Yup.number()
          .typeError('Age must be a number')
          .required('Age is required')
          .min(18, 'Minimum age is 18')
          .max(65, 'Maximum age is 65');
        break;
      case 'visits':
        shape[columnId] = Yup.number().typeError('Visits must be a number').required('Visits are required');
        break;
      case 'role':
        shape[columnId] = Yup.string().required('Role is required');
        break;
      case 'contact':
        shape[columnId] = Yup.string().required('Contact is required');
        break;
      case 'country':
        shape[columnId] = Yup.string().required('Country is required');
        break;
      case 'status':
        shape[columnId] = Yup.string().required('Status is required');
        break;
      case 'progress':
        shape[columnId] = Yup.number().typeError('Progress must be a number').required('Progress is required');
        break;
      default:
        // For any other fields, use a generic required message
        shape[columnId] = Yup.string().required('This field is required');
        break;
    }
  });
  return Yup.object().shape(shape);
}

// ==============================|| EDITABLE ROW ||============================== //

export default function EditRow<TData>({ row, onSave, grouping }: EditRowProps<TData>) {
  const [isEditMode, setEditMode] = useState(false);

  const initialEditData = useRef<Record<string, unknown>>(
    row.getVisibleCells().reduce(
      (acc, cell) => {
        if (cell.column.id !== 'Actions') {
          acc[cell.column.id] = cell.getValue();
        }
        return acc;
      },
      {} as Record<string, unknown>
    )
  );

  const [editData, setEditData] = useState<Record<string, unknown>>(initialEditData.current);

  const formik = useFormik({
    initialValues: editData,
    validationSchema: getYupSchemaForRow(row),
    onSubmit: (values, actions) => {
      onSave(values);
      setEditMode(false);
      actions.setSubmitting(false);
    }
  });
  const { values, errors, handleChange } = formik;

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditData(initialEditData.current);
    setEditMode(false);
  };

  const handleEditDataChange = (columnId: string, value: unknown) => {
    formik.setFieldValue(columnId, value);
  };

  return (
    <>
      {row.getVisibleCells().map((cell) => {
        const dataType = (cell.column.columnDef as any).dataType;
        const columnId = cell.column.id;
        const value = cell.getValue();
        // Hide value in grouped columns for leaf rows
        if (grouping && grouping.includes(columnId)) {
          return <TableCell key={cell.id} {...cell.column.columnDef.meta}></TableCell>;
        }

        let cellContent;
        // Render utility columns as non-editable
        if (['drag-handle', 'expander', 'select'].includes(columnId)) {
          cellContent = flexRender(cell.column.columnDef.cell, cell.getContext());
        } else {
          switch (dataType || columnId) {
            case 'avatar':
              cellContent = <Avatar alt="Avatar" size="sm" src={getImageUrl(`avatar-${value}.png`, ImagePath.USERS)} sx={{ m: 'auto' }} />;
              break;
            case 'number':
            case 'text':
              cellContent = isEditMode ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  name={columnId}
                  value={values[columnId]}
                  onChange={(e) => {
                    handleChange(e);
                    handleEditDataChange(columnId, dataType === 'number' ? Number(e.target.value) : e.target.value);
                  }}
                  error={!!errors[columnId]}
                  helperText={errors[columnId]}
                  slotProps={{ htmlInput: { sx: { py: 0.75 } } }}
                  sx={{ '& .MuiFormHelperText-root': { mx: 0 } }}
                />
              ) : (
                value
              );
              break;
            case 'select':
              cellContent = isEditMode ? (
                <Select
                  value={values[columnId]}
                  onChange={(e) => handleEditDataChange(columnId, e.target.value)}
                  size="small"
                  slotProps={{ input: { sx: { py: 0.5 } } }}
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
              cellContent = isEditMode ? (
                <Stack direction="row" sx={{ alignItems: 'center', pl: 1, minWidth: 120 }}>
                  <Slider
                    value={values[columnId] as number}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(_, newValue) => handleEditDataChange(columnId, newValue)}
                    valueLabelDisplay="auto"
                    aria-labelledby="non-linear-slider"
                  />
                </Stack>
              ) : (
                <LinearWithLabel value={value as number} sx={{ minWidth: 75 }} />
              );
              break;
            case 'actions':
              cellContent = isEditMode ? (
                <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Tooltip title="Cancel">
                    <IconButton color="error" onClick={handleCancelClick}>
                      <CloseOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Save">
                    <IconButton color="success" type="submit" onClick={formik.submitForm}>
                      <SendOutlined />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : (
                <Tooltip title="Edit">
                  <IconButton color="primary" onClick={handleEditClick}>
                    <EditTwoTone />
                  </IconButton>
                </Tooltip>
              );
              break;
            default:
              cellContent = value;
          }
        }

        return (
          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
            {cellContent as ReactNode}
          </TableCell>
        );
      })}
    </>
  );
}
