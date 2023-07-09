import { ArticleOutlined } from '@mui/icons-material';
import { AppLink } from '../../../../shared/AppLink';
import { StyledTreeItem } from '../../styled';
import { NestableSubTreeItemLabel } from '../nestableSubTreeItemLabel';

interface RecursiveFolderTreeProps {
  folder: any;
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
        {folder.folders.map((subFolder: any) => (
          <RecursiveFolderTree key={subFolder._id} folder={subFolder} />
        ))}
        {folder.documents.map((document: any) => (
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
