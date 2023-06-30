import { ArticleOutlined } from '@mui/icons-material';
import { AppLink } from '../../../../shared/AppLink';
import { StyledTreeItem } from '../../styled';

interface RecursiveFolderTreeProps {
  caseId: string;
  folder: any;
}

export const RecursiveFolderTree = ({
  caseId,
  folder,
}: RecursiveFolderTreeProps) => {
  return (
    <AppLink
      key={`${folder._id}`}
      href={`/cases/${caseId}/folders/${folder._id}`}
    >
      <StyledTreeItem key={folder._id} nodeId={folder._id} label={folder.name}>
        {folder.folders.map((subFolder: any) => (
          <RecursiveFolderTree
            key={subFolder._id}
            caseId={caseId}
            folder={subFolder}
          />
        ))}
        {folder.documents.map((document: any) => (
          <AppLink
            key={`${document._id}`}
            href={`/cases/${caseId}/folders/${folder._id}/documents/${document._id}`}
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
