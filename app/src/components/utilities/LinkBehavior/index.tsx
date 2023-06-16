import { SxProps } from '@mui/material';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';

export const LinkBehavior = forwardRef<
  HTMLAnchorElement,
  Omit<LinkProps, 'to'> & { href: LinkProps['to']; sx?: SxProps }
>((props, ref) => {
  const { href, ...other } = props;
  // Map href (MUI) -> to (react-router)
  return (
    <Link
      style={props.sx}
      data-testid="custom-link"
      ref={ref}
      to={href}
      {...other}
    />
  );
});
