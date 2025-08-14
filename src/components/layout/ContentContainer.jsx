import React from 'react';
import { Box } from '@mui/material';

// Consistent responsive content wrapper leveraging spacing design tokens.
// Provides horizontal clamps and vertical rhythm; optional maxWidth & gutter disabling.
const ContentContainer = ({ children, maxWidth = '1600px', disableGutters=false, sx }) => {
  return (
    <Box
      sx={theme => ({
        position: 'relative',
        width: '100%',
        margin: '0 auto',
        maxWidth,
        paddingLeft: disableGutters ? 0 : `clamp(${theme.spacing(2)}, 2vw, ${theme.spacing(4)})`,
        paddingRight: disableGutters ? 0 : `clamp(${theme.spacing(2)}, 2vw, ${theme.spacing(4)})`,
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(6),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(3.5),
        ...sx
      })}
    >
      {children}
    </Box>
  );
};

export default ContentContainer;
