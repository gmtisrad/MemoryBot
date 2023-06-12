import { Home } from './components/pages/Home';
import { Partner } from './components/pages/Partner';
import { Cases } from './components/pages/Cases';
import { Page } from './components/layout/Page';

const home = (
  <Page>
    <Home />
  </Page>
);

const cases = (
  <Page>
    <Cases />
  </Page>
);

const partner = (
  <Page>
    <Partner />
  </Page>
);

export const routes = [
  {
    path: '/',
    element: home,
  },
  {
    path: '/cases',
    element: cases,
  },
  {
    path: '/partner',
    element: partner,
  },
];
