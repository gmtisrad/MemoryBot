import {
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { ListItemNav } from '../ListItemNav';
import { DocumentsTree } from '../DocumentsTree';
import { AppLink } from '../../../../shared/AppLink';
import { StyledTreeItem } from '../../styled';
import { NestableSubTreeItemLabel } from '../nestableSubTreeItemLabel';
import { RecursiveFolderTree } from '../recursiveFolderTree';
import {
  ArrowDropDown,
  ArrowRight,
  ArticleOutlined,
} from '@mui/icons-material';
import { TreeView } from '@mui/lab';
import { IFolder, IPage, IProject } from '../../../../../types/app';

export const DrawerBody = ({
  pages,
  handleDrawerToggle,
  projects,
  isCasesLoading,
  documentId,
  handleProjectNodesExpanded,
  handleProjectNodesSelected,
  noteId,
  projectId,
  projectExpandedNodeIds,
  projectSelectedNodeIds,
  relevantFolder,
  handlePartnerNodesExpanded,
  handlePartnerNodesSelected,
  partnerExpandedNodeIds,
  partnerSelectedNodeIds,
}: {
  pages: IPage[];
  handleDrawerToggle: () => void;
  projects: IProject[];
  isCasesLoading: boolean;
  documentId?: string;
  handleProjectNodesExpanded: (event: any, nodeIds: string[]) => void;
  handleProjectNodesSelected: (event: any, nodeIds: string[]) => void;
  noteId?: string;
  projectId?: string;
  projectExpandedNodeIds: string[];
  projectSelectedNodeIds: string[];
  relevantFolder?: IFolder;
  handlePartnerNodesExpanded: (event: any, nodeIds: string[]) => void;
  handlePartnerNodesSelected: (event: any, nodeIds: string[]) => void;
  partnerExpandedNodeIds: string[];
  partnerSelectedNodeIds: string[];
  chatId?: string;
}) => {
  return (
    <div>
      <Toolbar disableGutters sx={{ height: '64px' }} />
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItemNav
            key={page.title}
            onClick={handleDrawerToggle}
            page={page}
          >
            <ListItemButton>
              <ListItemIcon>{page.icon}</ListItemIcon>
              <ListItemText
                primary={<Typography variant="body1">{page.title}</Typography>}
              />
            </ListItemButton>
            {location.pathname.includes(page.title.toLowerCase()) &&
              'cases' == page.title.toLowerCase() &&
              !!projects.length &&
              !isCasesLoading && (
                <DocumentsTree
                  documentId={documentId}
                  handleProjectNodesExpanded={handleProjectNodesExpanded}
                  handleProjectNodesSelected={handleProjectNodesSelected}
                  noteId={noteId}
                  projectId={projectId}
                  projectExpandedNodeIds={projectExpandedNodeIds}
                  projectSelectedNodeIds={projectSelectedNodeIds}
                  relevantFolder={relevantFolder}
                >
                  {projects.map((caseItem: any) => {
                    return (
                      <AppLink
                        key={`case-${caseItem._id}`}
                        href={`/cases/${caseItem._id}`}
                      >
                        <StyledTreeItem
                          key={`documents-${caseItem._id}`}
                          nodeId={caseItem._id}
                          label={caseItem.name}
                        >
                          <AppLink href={`/cases/${caseItem._id}/folders`}>
                            <StyledTreeItem
                              key={`files-${caseItem._id}-all`}
                              nodeId={`files-${caseItem._id}-all`}
                              label={
                                <NestableSubTreeItemLabel
                                  caseId={caseItem._id}
                                  label="Documents"
                                  type="documents"
                                />
                              }
                            >
                              {caseItem.folders
                                .filter((f: any) => f.type === 'documents')
                                .map((folder: any) => {
                                  return (
                                    <RecursiveFolderTree
                                      key={folder._id}
                                      folder={folder}
                                    />
                                  );
                                })}
                              {caseItem.documents.map((document: any) => {
                                return (
                                  <AppLink
                                    key={`case-documents-${document._id}`}
                                    href={`/cases/${caseItem._id}/documents/${document._id}`}
                                  >
                                    <StyledTreeItem
                                      nodeId={document._id}
                                      label={document.name}
                                      icon={<ArticleOutlined />}
                                    />
                                  </AppLink>
                                );
                              })}
                            </StyledTreeItem>
                          </AppLink>
                          <AppLink href={`/cases/${caseItem._id}/notes`}>
                            <StyledTreeItem
                              key={`notes-${caseItem._id}-all`}
                              nodeId={`notes-${caseItem._id}-all`}
                              label={
                                <NestableSubTreeItemLabel
                                  caseId={caseItem._id}
                                  label="Notes"
                                  type="notes"
                                />
                              }
                            >
                              {/* Dummy component to show notes is a sub-tree */}
                              <div></div>
                              {caseItem.folders
                                .filter((f: any) => f.type === 'notes')
                                .map((folder: any) => {
                                  return (
                                    <RecursiveFolderTree
                                      key={folder._id}
                                      folder={folder}
                                    />
                                  );
                                })}
                              {caseItem?.notes?.map((note: any) => {
                                return (
                                  <AppLink
                                    key={`case-notes-${note._id}`}
                                    href={`/cases/${caseItem._id}/notes/${note._id}`}
                                  >
                                    <StyledTreeItem
                                      nodeId={note._id}
                                      label={note.name}
                                      icon={<ArticleOutlined />}
                                    />
                                  </AppLink>
                                );
                              })}
                            </StyledTreeItem>
                          </AppLink>
                        </StyledTreeItem>
                      </AppLink>
                    );
                  })}
                </DocumentsTree>
              )}
            {location.pathname.includes(page.title.toLowerCase()) &&
              'Partner' == page.title &&
              !!projects.length &&
              !isCasesLoading && (
                <TreeView
                  aria-label="partner tree"
                  defaultCollapseIcon={<ArrowDropDown />}
                  defaultExpandIcon={<ArrowRight />}
                  defaultEndIcon={<div style={{ width: 24 }} />}
                  onNodeToggle={handlePartnerNodesExpanded}
                  onNodeSelect={handlePartnerNodesSelected}
                  expanded={partnerExpandedNodeIds}
                  selected={partnerSelectedNodeIds}
                  sx={{ pt: 0, pb: 0 }}
                >
                  {projects.map((caseItem: any) => {
                    return (
                      <AppLink
                        key={`partner-${caseItem._id}`}
                        href={`/partner/${caseItem._id}/chat`}
                      >
                        <StyledTreeItem
                          key={`chats-${caseItem._id}`}
                          nodeId={caseItem._id}
                          label={caseItem.name}
                        >
                          <StyledTreeItem
                            nodeId={`chats-${caseItem._id}-all`}
                            label="Chats"
                          >
                            {caseItem.chats.map((chat: any, idx: number) => {
                              return (
                                <AppLink
                                  key={chat._id}
                                  href={`/partner/${caseItem._id}/chat/${chat._id}`}
                                >
                                  <StyledTreeItem
                                    nodeId={chat._id}
                                    label={`${chat.name}-${idx}`}
                                    sx={{
                                      backgroundColor: `${
                                        chatId == chat._id
                                          ? 'var(--joy-palette-neutral-200, #D8D8DF)'
                                          : 'transparent'
                                      }`,
                                    }}
                                  />
                                </AppLink>
                              );
                            })}
                          </StyledTreeItem>
                          <AppLink
                            key={'generate-documents'}
                            sx={{
                              textDecoration: 'none',
                              color: 'inherit',
                            }}
                            href={`/partner/${caseItem._id}/generate`}
                          >
                            <StyledTreeItem
                              nodeId={`generated-documents-${caseItem._id}`}
                              label="Generate Documents"
                            >
                              {caseItem.generatedDocuments.map(
                                (genDoc: any) => {
                                  return (
                                    <AppLink
                                      key={`generated-documents-${genDoc._id}`}
                                      sx={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                      }}
                                      href={`/partner/${caseItem._id}/generated/${genDoc._id}`}
                                    >
                                      <StyledTreeItem
                                        key={genDoc._id}
                                        nodeId={genDoc._id}
                                        label={genDoc.documentType}
                                        icon={<ArticleOutlined />}
                                      />
                                    </AppLink>
                                  );
                                },
                              )}
                            </StyledTreeItem>
                          </AppLink>
                        </StyledTreeItem>
                      </AppLink>
                    );
                  })}
                </TreeView>
              )}
          </ListItemNav>
        ))}
      </List>
    </div>
  );
};
