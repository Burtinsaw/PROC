import { Card, CardHeader, CardContent } from '@mui/material';

export default function MainCard({ title, subheader, children, content = true, sx = {}, ...others }) {
  return (
    <Card elevation={3} sx={{ borderRadius: 3, ...sx }} {...others}>
      {(title || subheader) && (
        <CardHeader title={title} subheader={subheader} sx={{ pb: 0.5 }} />
      )}
      {content ? (
        <CardContent>
          {children}
        </CardContent>
      ) : (
        children
      )}
    </Card>
  );
}
