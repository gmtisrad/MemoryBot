import { matchRoutes, useLocation } from 'react-router-dom';
import { routes } from '../../routes';

export const useCurrentPath = () => {
  const location = useLocation();
  const matches = matchRoutes(routes, location) || [];

  return matches[0];
};
