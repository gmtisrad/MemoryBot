import { FC, useCallback, useMemo, useState } from 'react';
import { TopNav } from '../TopNav';
import {
  Box,
  Container,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowDropDown,
  ArrowRight,
  ArticleOutlined,
  Home,
  SmartToy,
  Work,
} from '@mui/icons-material';
import TreeView from '@mui/lab/TreeView';
import { LinkBehavior } from '../../utilities/LinkBehavior';
import { useCurrentPath } from '../../../hooks/useCurrentPath';
import { useGetCases } from '../../../queries/useGetCases';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { AppLink } from '../../shared/AppLink';
import { StyledTreeItem } from './styled';
import { RecursiveFolderTree } from './components/recursiveFolderTree';
import { AddCaseModal } from '../../pages/Cases/components/AddCaseModal';
import { AddFolderModal } from '../../pages/Cases/components/AddFolderModal';
import { AddDocumentModal } from '../../pages/Cases/components/AddDocumentModal';
import { useAppStore } from '../../../zustand/app';
import { NestableSubTreeItemLabel } from './components/nestableSubTreeItemLabel';

function getAllParents({
  folders,
  folderId,
}: {
  folders: any[];
  folderId?: string;
}) {
  const parents: any[] = [];

  if (!folderId) {
    return parents;
  }

  let currentFolder = folders?.find((folder) => folder._id === folderId);

  while (currentFolder && currentFolder.parent !== null) {
    const parentFolder = folders.find(
      (folder) => folder._id === currentFolder.parent,
    );
    if (parentFolder) {
      parents.push(parentFolder);
      currentFolder = parentFolder;
    } else {
      break;
    }
  }

  return parents;
}

const containerStyles = {
  flex: 1,
  overflow: 'auto',
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IPageProps {}

const boxStyles = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
};

const getContentStyles = (contentMarginLeft: string) => ({
  marginLeft: contentMarginLeft,
  overflowY: 'auto' /* Allows vertical scrolling */,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  // backgroundColor: 'var(--joy-palette-neutral-100, #f7f7f8)',
});

const pages = [
  { title: 'Home', icon: <Home /> },
  { title: 'Cases', icon: <Work /> },
  { title: 'Partner', icon: <SmartToy /> },
];

const flattenFolders = ({ folders }: { folders?: any[] }) => {
  const flat: any[] = [];

  const traverse = (folder: any) => {
    flat.push(folder);
    if (folder.folders && folder.folders.length > 0) {
      for (const subFolder of folder.folders) {
        traverse(subFolder);
      }
    }
  };

  folders?.forEach(traverse);
  return flat;
};

export const Page: FC<IPageProps> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { chatId, caseId, folderId, documentId, noteId } = useParams();
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const { pathname } = useLocation();

  const isNotesPath = pathname.includes('/notes');

  const location = useLocation();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    isLoading: isCasesLoading,
    data: { cases },
  } = useGetCases({ userId: '649648ac4cea1cc6acc1e35e' });

  const selected = useMemo(
    () => [documentId, chatId, noteId],
    [chatId, documentId, noteId],
  );

  const caseFolders = useMemo(() => {
    return cases.find((c: any) => c._id === caseId)?.folders;
  }, [caseId, cases]);

  const flattenedCaseFolders = useMemo(() => {
    return flattenFolders({ folders: caseFolders });
  }, [caseFolders]);

  const allParentIds = useMemo(() => {
    const allParentFolders = getAllParents({
      folders: flattenedCaseFolders,
      folderId,
    });
    return allParentFolders.map((folder) => folder?._id);
  }, [flattenedCaseFolders, folderId]);

  const expanded = useMemo(
    () =>
      [
        caseId,
        folderId,
        ...(folderId && cases.length ? allParentIds : []),
        ...(documentId || isDocumentsExpanded ? [`files-${caseId}-all`] : []),
        ...(noteId || isNotesExpanded ? [`files-${caseId}-all`] : []),
        ...(isNotesPath || noteId ? [`notes-${caseId}-all`] : []),
      ].filter((o) => !!o),
    [
      allParentIds,
      caseId,
      cases.length,
      documentId,
      folderId,
      isDocumentsExpanded,
      isNotesExpanded,
      isNotesPath,
      noteId,
    ],
  );

  const paths = useCurrentPath();

  const currentPath = useMemo(() => {
    const base = paths[paths.length - 1].pathname;
    return base;
  }, [paths]);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(!mobileOpen);
  }, [mobileOpen]);

  const drawerWidth = useMemo(
    () => (isSmallScreen ? '180px' : '280px'),
    [isSmallScreen],
  );

  const container =
    window !== undefined ? () => window.document.body : undefined;

  const contentMarginLeft = useMemo(() => {
    if (isSmallScreen) {
      if (mobileOpen) {
        return drawerWidth;
      }
    } else {
      return drawerWidth;
    }
    return '0';
  }, [drawerWidth, isSmallScreen, mobileOpen]);

  const drawer = useMemo(
    () => (
      <div>
        <Toolbar disableGutters sx={{ height: '64px' }} />
        <Divider />
        <List>
          {pages.map((page) => (
            <ListItem
              key={page.title}
              onClick={handleDrawerToggle}
              component={LinkBehavior}
              sx={{
                my: 2,
                display: 'block',
                cursor: 'pointer',
                color: 'black',
                marginTop: 0,
                marginBottom: 0,
                pt: 0,
                pb: 0,
                pl: 0,
                pr: 0,
                backgroundColor: `${
                  currentPath.includes(page.title.toLowerCase())
                    ? 'var(--joy-palette-neutral-100, #EBEBEF)'
                    : 'transparent'
                }`,
              }}
              href={`/${page.title == 'Home' ? '' : page.title.toLowerCase()}`}
            >
              <ListItemButton>
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1">{page.title}</Typography>
                  }
                />
              </ListItemButton>
              {location.pathname.includes(page.title.toLowerCase()) &&
                'cases' == page.title.toLowerCase() &&
                !!cases.length &&
                !isCasesLoading && (
                  <TreeView
                    aria-label="documents tree"
                    defaultCollapseIcon={<ArrowDropDown />}
                    defaultExpandIcon={<ArrowRight />}
                    expanded={expanded as string[]}
                    selected={selected as string[]}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                    sx={{ pt: 0, pb: 0 }}
                  >
                    {cases.map((caseItem: any) => {
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
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setIsDocumentsExpanded(!isDocumentsExpanded);
                                }}
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
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setIsNotesExpanded(!isNotesExpanded);
                                }}
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
                  </TreeView>
                )}
              {location.pathname.includes(page.title.toLowerCase()) &&
                'Partner' == page.title &&
                !!cases.length &&
                !isCasesLoading && (
                  <TreeView
                    aria-label="partner tree"
                    defaultCollapseIcon={<ArrowDropDown />}
                    defaultExpandIcon={<ArrowRight />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                    expanded={expanded as string[]}
                    selected={selected as string[]}
                    sx={{ pt: 0, pb: 0 }}
                  >
                    {cases.map((caseItem: any) => {
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
            </ListItem>
          ))}
        </List>
      </div>
    ),
    [
      cases,
      chatId,
      currentPath,
      expanded,
      handleDrawerToggle,
      isCasesLoading,
      location.pathname,
      selected,
    ],
  );

  const {
    isAddCaseModalOpen,
    toggleIsAddCaseModalOpen,
    isAddFolderModalOpen,
    toggleIsAddFolderModalOpen,
    isAddDocumentModalOpen,
    toggleIsAddDocumentModalOpen,
  } = useAppStore();

  return (
    <Box id="page-wrapper" sx={boxStyles}>
      <Drawer
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: '280px',
          '& .MuiDrawer-paper': {
            backgroundColor: 'var(--joy-palette-neutral-50, #F7F7F8)',
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {drawer}
      </Drawer>
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            backgroundColor: 'var(--joy-palette-neutral-50, #F7F7F8)',
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
        anchor="left"
      >
        {drawer}
      </Drawer>
      <Box id="content-wrapper" sx={getContentStyles(contentMarginLeft)}>
        <TopNav handleDrawerToggle={handleDrawerToggle} />
        <Container maxWidth={false} disableGutters sx={containerStyles}>
          <Outlet />
        </Container>
      </Box>
      <AddCaseModal
        toggleModalOpen={toggleIsAddCaseModalOpen}
        open={isAddCaseModalOpen}
      />
      <AddFolderModal
        toggleModalOpen={toggleIsAddFolderModalOpen}
        open={isAddFolderModalOpen}
        type="document"
      />
      <AddDocumentModal
        toggleModalOpen={toggleIsAddDocumentModalOpen}
        open={isAddDocumentModalOpen}
      />
    </Box>
  );
};
