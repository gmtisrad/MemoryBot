import { Page } from './components/layout/Page';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Home } from './components/pages/home';
import { CssBaseline } from '@mui/material';
import { StrictMode } from 'react';
import { Partner } from './components/pages/partner';
import { Documents } from './components/pages/documents';

const home = (
  <Page>
    <Home />
  </Page>
);

const documents = (
  <Page>
    <Documents />
  </Page>
);

const partner = (
  <Page>
    <Partner />
  </Page>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: home,
  },
  {
    path: '/documents',
    element: documents,
  },
  {
    path: '/partner',
    element: partner,
  },
]);

function App() {
  return (
    <StrictMode>
      <CssBaseline />
      <RouterProvider router={router} />
    </StrictMode>
  );
}

export default App;
