import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from 'styled-components';
import { Pagination } from '@mui/material';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { useWindowSize } from 'react-use';

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
    margin: 0 16px;
  }
  height: 100%;
`;

const StyledPagination = styled(Pagination)`
  margin: 16px 0;

  .MuiPagination-ul {
    justify-content: center;
  }
`;

const StyledDocument = styled(Document)`
  display: flex;
  justify-content: center;
`;

export const PDFRenderer = ({ pdfUrl }: PDFRendererProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const { height, width } = useWindowSize();

  const theme = useTheme();
  const isXsDevice = useMediaQuery(theme.breakpoints.down('xs'));

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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
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
      <Box
        sx={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'auto',
        }}
      >
        <StyledDocument file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <StyledPage
            height={height - 64 - 128 - 8}
            width={width < 600 ? width - 80 : undefined}
            pageNumber={pageNumber}
          />
        </StyledDocument>
      </Box>
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
