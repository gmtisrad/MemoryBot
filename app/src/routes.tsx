import { Cases } from './components/pages/Cases';
import { Page } from './components/layout/Page';
import { Generate } from './components/pages/Generate';
import { Generated } from './components/pages/Generated';
import { Home } from './components/pages/home';
import { Partner } from './components/pages/partner';
import { Documents } from './components/pages/Documents';

const home = <Home />;

const cases = <Cases />;

const partner = <Partner />;

const generate = <Generate />;

const generated = <Generated />;

const documents = <Documents />;

const partnerRoutes = [
  {
    path: '/partner',
    element: <div>Partner</div>,
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

const caseRoutes = [
  {
    path: '/cases',
    element: cases,
  },
  {
    path: '/cases/:caseId',
    element: cases,
  },
  {
    path: '/cases/:caseId/folders',
    element: cases,
  },
  {
    path: '/cases/:caseId/folders/:folderId',
    element: cases,
  },
  {
    path: '/cases/:caseId/folders/:folderId/documents',
    element: cases,
  },
  {
    path: '/cases/:caseId/folders/:folderId/documents/:documentId',
    element: documents,
  },
];

export const routes = [
  {
    element: <Page />,
    children: [
      {
        path: '/',
        element: home,
      },
      ...caseRoutes,
      ...partnerRoutes,
    ],
  },
];
