import { ArrowDropDown, ArrowRight } from '@mui/icons-material';
import { TreeView } from '@mui/lab';
import { IFolder } from '../../../../../types/app';

export const DocumentsTree = ({
  children,
  documentId,
  relevantFolder,
  noteId,
  projectId,
  projectExpandedNodeIds,
  projectSelectedNodeIds,
  handleProjectNodesExpanded,
  handleProjectNodesSelected,
}: {
  children: React.ReactNode;
  documentId?: string;
  handleProjectNodesExpanded: (event: any, nodeIds: string[]) => void;
  handleProjectNodesSelected: (event: any, nodeIds: string[]) => void;
  noteId?: string;
  projectId?: string;
  projectExpandedNodeIds: string[];
  projectSelectedNodeIds: string[];
  relevantFolder?: IFolder;
}) => {
  return (
    <TreeView
      aria-label="documents tree"
      defaultCollapseIcon={<ArrowDropDown />}
      defaultExpandIcon={<ArrowRight />}
      expanded={[
        ...(projectExpandedNodeIds as string[]),
        ...(documentId || relevantFolder?.type === 'documents'
          ? [`files-${projectId}-all`]
          : []),
        ...(noteId || relevantFolder?.type === 'notes'
          ? [`notes-${projectId}-all`]
          : []),
      ]}
      selected={projectSelectedNodeIds as string[]}
      defaultEndIcon={<div style={{ width: 24 }} />}
      onNodeToggle={handleProjectNodesExpanded}
      onNodeSelect={handleProjectNodesSelected}
      sx={{ pt: 0, pb: 0 }}
    >
      {children}
    </TreeView>
  );
};
