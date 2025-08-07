import { ReactElement } from 'react';

// material-ui
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

// third party
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Row } from '@tanstack/react-table';

// types
import { TableDataProps } from 'types/table';

// assets
import DragOutlined from '@ant-design/icons/DragOutlined';

// ==============================|| DRAGGABLE ROW ||============================== //

export default function DraggableRow({
  row,
  children
}: {
  row: Row<TableDataProps>;
  reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
  children: ReactElement;
}) {
  const { setNodeRef: setDropRef, isOver: isOverCurrent } = useDroppable({ id: `row-${row.id}` });

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({ id: `row-${row.id}` });

  return (
    <TableRow ref={setDropRef} sx={{ opacity: isDragging ? 0.5 : 1, bgcolor: isOverCurrent ? 'primary.lighter' : 'inherit' }}>
      <TableCell>
        <IconButton
          ref={setDragRef}
          {...listeners}
          {...attributes}
          size="small"
          color="secondary"
          disabled={row.getIsGrouped()}
          sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
        >
          <DragOutlined />
        </IconButton>
      </TableCell>
      {children}
    </TableRow>
  );
}
