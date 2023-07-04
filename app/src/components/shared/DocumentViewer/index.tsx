import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { styled, useMediaQuery, useTheme } from '@mui/material';

interface DocumentViewerProps {
  docs: {
    uri: string;
  }[];
}

const StyledDocViewer = styled(DocViewer)`
  margin: 0;
  width: 100%;
`;

export const DocumentViewer = ({ docs }: DocumentViewerProps) => {
  const theme = useTheme();
  const isSmDevice = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledDocViewer
      config={{
        pdfZoom: {
          defaultZoom: isSmDevice ? 1.4 : 1,
          zoomJump: 0.1,
        },
      }}
      documents={docs}
      pluginRenderers={DocViewerRenderers}
    />
  );
};
