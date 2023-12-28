import { ArticleOutlined } from '@mui/icons-material';
import { AppLink } from '../../../../shared/AppLink';
import { StyledTreeItem } from '../../styled';
import { NestableSubTreeItemLabel } from '../nestableSubTreeItemLabel';
import { IDocument, IFolder } from '../../../../../types/app';

interface RecursiveFolderTreeProps {
  folder: IFolder;
}

export const RecursiveFolderTree = ({ folder }: RecursiveFolderTreeProps) => {
  return (
    <AppLink
      key={`recursive-folder-tree-link-${folder._id}`}
      href={`/cases/${folder.caseId}/folders/${folder._id}`}
    >
      <StyledTreeItem
        nodeId={folder._id}
        label={
          <NestableSubTreeItemLabel
            caseId={folder.caseId}
            folderId={folder._id}
            label={folder.name}
          />
        }
      >
        {folder.folders.map((subFolder: IFolder) => (
          <RecursiveFolderTree key={subFolder._id} folder={subFolder} />
        ))}
        {folder.documents.map((document: IDocument) => (
          <AppLink
            key={document._id}
            href={`/cases/${folder.caseId}/folders/${folder._id}/documents/${document._id}`}
          >
            <StyledTreeItem
              nodeId={document._id}
              label={document.name}
              icon={<ArticleOutlined />}
            />
          </AppLink>
        ))}
      </StyledTreeItem>
    </AppLink>
  );
};
