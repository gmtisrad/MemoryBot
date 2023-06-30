import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';
import Pagination from '@mui/lab/Pagination';
import { Box } from '@mui/material';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

interface PDFRendererProps {
  pdfUrl: string;
}

const StyledPage = styled(Page)`
  canvas {
    border: 1px solid black;
    margin: 0 auto;
  }
`;

const StyledPagination = styled(Pagination)`
  margin: 16px 0;

  .MuiPagination-ul {
    justify-content: center;
  }
`;

export const PDFRenderer = ({ pdfUrl }: PDFRendererProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPageNumber(value);
  };

  return (
    <Box
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      {numPages && (
        <StyledPagination
          count={numPages}
          page={pageNumber}
          onChange={handlePageChange}
          sx={{ justifyContent: 'center' }}
        />
      )}
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <StyledPage pageNumber={pageNumber} />
      </Document>
      {numPages && (
        <StyledPagination
          count={numPages}
          page={pageNumber}
          onChange={handlePageChange}
          sx={{ justifyContent: 'center' }}
        />
      )}
    </Box>
  );
};
