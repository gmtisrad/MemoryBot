import { CreateNewFolderOutlined, PostAddOutlined } from '@mui/icons-material';
import { Box, styled } from '@mui/material';
import { useAppStore } from '../../../../../zustand/app';
import { MouseEventHandler } from 'react';

const TreeButtonsContainer = styled(Box)`
  visibility: hidden;
  display: flex;
  align-items: center;
`;

const TreeLabelContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover > #tree-item-button-group {
    visibility: visible;
  }
`;

const StyledCreateNewFolderOutlined = styled(CreateNewFolderOutlined)`
  border-radius: 50%;
  opacity: 0.25;
  width: 25px;

  &:hover {
    opacity: 1;
  }
`;

const StyledPostAddOutlinedIcon = styled(PostAddOutlined)`
  border-radius: 50%;
  opacity: 0.25;
  width: 25px;

  &:hover {
    opacity: 1;
  }
`;

interface NestableSubTreeItemLabelProps {
  label: string;
  caseId?: string;
  folderId?: string;
  type?: string;
}

export const NestableSubTreeItemLabel = ({
  label,
  caseId,
  folderId,
  type,
}: NestableSubTreeItemLabelProps) => {
  const appStore = useAppStore();
  const { toggleIsAddFolderModalOpen, toggleIsAddDocumentModalOpen } = appStore;

  const handleAddFolderClick: MouseEventHandler<unknown> = (e) => {
    e.stopPropagation();
    toggleIsAddFolderModalOpen({ caseId, folderId });
  };

  const handleAddDocumentClick: MouseEventHandler<unknown> = (e) => {
    e.stopPropagation();
    toggleIsAddDocumentModalOpen({ caseId, folderId });
  };

  return (
    <TreeLabelContainer>
      {label}
      <TreeButtonsContainer id="tree-item-button-group">
        <StyledCreateNewFolderOutlined
          onClick={handleAddFolderClick}
          fontSize="small"
        />
        <StyledPostAddOutlinedIcon
          onClick={handleAddDocumentClick}
          fontSize="small"
        />
      </TreeButtonsContainer>
    </TreeLabelContainer>
  );
};
