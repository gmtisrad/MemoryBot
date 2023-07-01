import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

interface DocumentViewerProps {
  docs: {
    uri: string;
  }[];
}

export const DocumentViewer = ({ docs }: DocumentViewerProps) => {
  return <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />;
};
