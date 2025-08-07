// material-ui
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';

// third party
import { CSVLink } from 'react-csv';
import { Headers } from 'react-csv/lib/core';

// assets
import DownloadOutlined from '@ant-design/icons/DownloadOutlined';

interface CSVExportProps<T extends object> {
  data: T[];
  filename: string;
  headers?: Headers;
}

// ==============================|| CSV EXPORT ||============================== //

export default function CSVExport<T extends object>({ data, filename, headers }: CSVExportProps<T>) {
  return (
    <CSVLink data={data} filename={filename} headers={headers} tabIndex={-1}>
      <Tooltip title="CSV Export">
        <Box sx={{ color: 'text.secondary' }}>
          <DownloadOutlined style={{ fontSize: '24px', marginTop: 4, marginRight: 4, marginLeft: 4 }} />
        </Box>
      </Tooltip>
    </CSVLink>
  );
}
