import { ListItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCurrentPath } from '../../../../../hooks/useCurrentPath';
import { useMemo } from 'react';

export const ListItemNav = ({
  children,
  page,
  onClick,
}: {
  children: React.ReactNode;
  page: { title: string };
  onClick: () => void;
}) => {
  const navigate = useNavigate();
  const paths = useCurrentPath();

  const currentPath = useMemo(() => {
    const base = paths[paths.length - 1].pathname;
    return base;
  }, [paths]);

  return (
    <ListItem
      key={page.title}
      onClick={() => {
        navigate(`/${page.title == 'Home' ? '' : page.title.toLowerCase()}`);
        onClick();
      }}
      sx={{
        my: 2,
        display: 'block',
        cursor: 'pointer',
        color: 'black',
        marginTop: 0,
        marginBottom: 0,
        pt: 0,
        pb: 0,
        pl: 0,
        pr: 0,
        backgroundColor: `${
          currentPath.includes(page.title.toLowerCase())
            ? 'var(--joy-palette-neutral-100, #EBEBEF)'
            : 'transparent'
        }`,
      }}
    >
      {children}
    </ListItem>
  );
};
