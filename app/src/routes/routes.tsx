import { Cases } from '../components/pages/Cases';
import { Page } from '../components/layout/Page';
import { Generate } from '../components/pages/Generate';
import { Generated } from '../components/pages/Generated';
import { Documents } from '../components/pages/Documents';
import { Partner } from '../components/pages/Partner';
import { Home } from '../components/pages/Home';
import { Notes } from '../components/pages/Notes';

const home = <Home />;

const cases = <Cases />;

const partner = <Partner />;

const generate = <Generate />;

const generated = <Generated />;

const documents = <Documents />;

const notes = <Notes />;

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
  {
    path: '/cases/:caseId/documents/:documentId',
    element: documents,
  },
  {
    path: '/cases/:caseId/notes',
    element: notes,
  },
  {
    path: '/cases/:caseId/notes/:noteId',
    element: notes,
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
