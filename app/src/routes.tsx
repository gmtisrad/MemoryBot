import { Home } from './components/pages/Home';
import { Partner } from './components/pages/Partner';
import { Cases } from './components/pages/Cases';
import { Page } from './components/layout/Page';
import { Generate } from './components/pages/Generate';
import { Generated } from './components/pages/Generated';

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

const generate = (
  <Page>
    <Generate />
  </Page>
);

const generated = (
  <Page>
    <Generated />
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
    element: <Page>Partner</Page>,
  },
  {
    path: '/partner/:caseId/chat/',
    element: partner,
  },
  {
    path: '/partner/:caseId/chat/:chatId',
    element: partner,
  },
  {
    path: '/partner/:caseId/generate',
    element: generate,
  },
  {
    path: `/partner/:caseId/generated/:generatedDocumentId`,
    element: generated,
  },
];
