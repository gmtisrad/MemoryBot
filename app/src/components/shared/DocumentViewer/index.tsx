import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import { styled } from '@mui/material';

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
  return (
    <StyledDocViewer
      key={docs[0]?.uri}
      documents={docs}
      pluginRenderers={DocViewerRenderers}
    />
  );
};
