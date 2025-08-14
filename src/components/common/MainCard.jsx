import { Card, CardHeader, CardContent, Divider } from '@mui/material';

/* MainCard Enhanced
   Adds: gradient background, subtle border, hover lift (if hover prop), dense prop
*/
export default function MainCard({ title, subheader, children, content = true, sx = {}, hover = false, dense = false, ...others }) {
  return (
    <Card
      elevation={0}
      sx={(t) => ({
        position: 'relative',
        borderRadius: 3,
        background: t.palette.mode === 'dark'
          ? 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))'
          : 'linear-gradient(145deg, #ffffff, #f5f7fb)',
        border: '1px solid',
        borderColor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        boxShadow: t.palette.mode === 'dark'
          ? '0 2px 10px -2px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 2px 10px -2px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.03)',
        transition: 'all .25s ease',
        ...(hover && {
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: t.palette.mode === 'dark'
              ? '0 6px 18px -4px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)'
              : '0 8px 22px -4px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)'
          }
        }),
        ...sx
      })}
      {...others}
    >
      {(title || subheader) && (
        <>
          <CardHeader
            titleTypographyProps={{ fontWeight: 600, fontSize: '1rem', letterSpacing: '-0.25px' }}
            subheaderTypographyProps={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}
            sx={{ pb: 0.5, '& .MuiCardHeader-content': { py: dense ? 0.5 : 0 } }}
            title={title}
            subheader={subheader}
          />
          <Divider sx={{ opacity: 0.5 }} />
        </>
      )}
      {content ? (
        <CardContent sx={{ p: dense ? 1.5 : 2.5 }}>
          {children}
        </CardContent>
      ) : (
        children
      )}
    </Card>
  );
}
