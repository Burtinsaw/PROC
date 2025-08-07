// material-ui
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import Dot from 'components/@extended/Dot';
import Avatar from 'components/@extended/Avatar';

import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// types
import { KanbanComment, KanbanProfile } from 'types/kanban';

interface Props {
  comment: KanbanComment;
  profile: KanbanProfile;
}

// ==============================|| KANBAN BOARD - ITEM COMMENT ||============================== //

export default function ItemComment({ comment, profile }: Props) {
  return (
    <MainCard
      content={false}
      sx={(theme: Theme) => ({ bgcolor: 'grey.50', p: 1.5, mt: 1.25, ...theme.applyStyles('dark', { bgcolor: 'grey.100' }) })}
    >
      <Grid container spacing={1.5}>
        <Grid size={12}>
          <Grid container wrap="nowrap" alignItems="center" spacing={1}>
            <Grid>
              <Avatar
                sx={{ width: 24, height: 24 }}
                size="sm"
                alt="User 1"
                src={profile && profile.avatar && getImageUrl(`${profile.avatar}`, ImagePath.USERS)}
              />
            </Grid>
            <Grid size="grow">
              <Grid container alignItems="center" spacing={1} justifyContent="space-between">
                <Grid>
                  <Typography variant="subtitle1">{profile.name}</Typography>
                </Grid>
                <Grid>
                  <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                    <Dot size={6} sx={{ mt: -0.25 }} color="secondary" />
                    <Typography variant="caption" color="secondary">
                      {profile.time}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Typography variant="body2">{comment?.comment}</Typography>
        </Grid>
      </Grid>
    </MainCard>
  );
}
