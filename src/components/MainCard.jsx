import { ReactNode, forwardRef } from 'react';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';

const MainCard = forwardRef(
  (
    {
      border = true,
      boxShadow,
      children,
      content = true,
      contentSX = {},
      darkTitle,
      divider = true,
      elevation,
      secondary,
      sx = {},
      title,
      ...others
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        elevation={elevation || (boxShadow ? 1 : 0)}
        sx={{
          position: 'relative',
          border: border ? '1px solid' : 'none',
          borderRadius: 2,
          borderColor: (theme) => theme.palette.divider,
          ...sx
        }}
        {...others}
      >
        {/* card header and action */}
        {!darkTitle && title && (
          <CardHeader
            sx={{ p: 2.5 }}
            title={title}
            action={secondary}
          />
        )}
        {darkTitle && title && (
          <CardHeader 
            sx={{ p: 2.5 }} 
            title={title} 
            action={secondary}
          />
        )}

        {/* content & header divider */}
        {title && divider && <Divider />}

        {/* card content */}
        {content && (
          <CardContent sx={{ p: 2.5, ...contentSX }}>
            {children}
          </CardContent>
        )}
        {!content && children}
      </Card>
    );
  }
);

MainCard.displayName = 'MainCard';

export default MainCard;
