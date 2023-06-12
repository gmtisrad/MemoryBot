import { matchRoutes, useLocation } from 'react-router-dom';
import { routes } from '../../routes';

export const useCurrentPath = () => {
  const location = useLocation();
  const matchedRoutes = matchRoutes(routes, location);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return matchedRoutes!;
};
