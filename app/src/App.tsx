import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline } from '@mui/material';
import { StrictMode } from 'react';
import { routes } from './routes/routes';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { pdfjs } from 'react-pdf';

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.js',
//   import.meta.url,
// ).toString();

// TODO: Fix fast refresh
const router = createBrowserRouter(routes);

const queryClient = new QueryClient();

function App() {
  return (
    <StrictMode>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <RouterProvider router={router} />
        </QueryClientProvider>
      </LocalizationProvider>
    </StrictMode>
  );
}

export default App;
