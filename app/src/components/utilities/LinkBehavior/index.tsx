import { SxProps } from '@mui/material';
import { MouseEventHandler, ReactNode, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';

export const LinkBehavior = forwardRef<
  HTMLDivElement,
  { href: string; sx?: SxProps; children: ReactNode }
>((props, ref) => {
  const { href, ...other } = props;

  const navigate = useNavigate();

  const handleNavigate: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigate(href);
  };

  return (
    <div
      role="button"
      data-testid="custom-link"
      ref={ref}
      onClick={handleNavigate}
      {...other}
    />
  );
});
