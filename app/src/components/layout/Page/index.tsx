import {
  FC,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TopNav } from '../TopNav';
import { Box, Container, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Home, SmartToy, Work } from '@mui/icons-material';
import { useGetCases } from '../../../queries/useGetCases';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { AddCaseModal } from '../../pages/Cases/components/AddCaseModal';
import { AddFolderModal } from '../../pages/Cases/components/AddFolderModal';
import { AddDocumentModal } from '../../pages/Cases/components/AddDocumentModal';
import { useAppStore } from '../../../zustand/app';
import { flattenFolders, getAllFolders } from './functions';
import { DrawerBody } from './components/Drawer';
import { IFolder, IPage, IProject } from '../../../types/app';

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

const pages: IPage[] = [
  { title: 'Home', icon: <Home /> },
  { title: 'Cases', icon: <Work /> },
  { title: 'Partner', icon: <SmartToy /> },
];

export const Page: FC<IPageProps> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { chatId, caseId, folderId, documentId, noteId } = useParams();
  const [expandedInitialized, setExpandedInitialized] =
    useState<boolean>(false);

  const [partnerExpandedNodeIds, setPartnerExpandedNodeIds] = useState<
    string[]
  >([]);
  const [partnerSelectedNodeIds, setPartnersSelectedNodeIds] = useState<
    string[]
  >([]);

  const { pathname } = useLocation();

  const isNotesPath = pathname.includes('/notes');

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    isLoading: isCasesLoading,
    data: { cases },
  } = useGetCases({ userId: '649648ac4cea1cc6acc1e35e' });

  const caseFolders = useMemo(() => {
    return cases.find((c: IProject) => c._id === caseId)?.folders;
  }, [caseId, cases]);

  const flattenedCaseFolders = useMemo(() => {
    return flattenFolders({ folders: caseFolders });
  }, [caseFolders]);

  const allFolders = useMemo(() => {
    return getAllFolders({
      folders: flattenedCaseFolders,
      folderId,
    });
  }, [flattenedCaseFolders, folderId]);

  // All the parent folders of the current selected and the current selected ID
  const allFolderIds = useMemo(() => {
    return allFolders.map((folder) => folder?._id);
  }, [allFolders]);

  const relevantFolder = allFolders?.find((f: IFolder) => f._id === folderId);

  const [caseExpandedNodeIds, setCaseExpandedNodeIds] = useState<string[]>(
    [
      caseId,
      ...(folderId && cases.length ? allFolderIds : []),
      ...(documentId || relevantFolder?.type === 'documents'
        ? [`files-${caseId}-all`]
        : []),
      ...(noteId || relevantFolder?.type === 'notes'
        ? [`notes-${caseId}-all`]
        : []),
      ...(isNotesPath || noteId ? [`notes-${caseId}-all`] : []),
    ].filter((o?: string) => !!o) as string[],
  );
  const [caseSelectedNodeIds, setCaseSelectedNodeIds] = useState<string[]>(
    [documentId!, chatId!, noteId!].filter((o) => !!o),
  );

  useEffect(() => {
    if (!expandedInitialized && relevantFolder) {
      setCaseExpandedNodeIds([
        ...(caseId ? [caseId] : []),
        ...(folderId && cases.length ? allFolderIds : []),
        ...(documentId || relevantFolder?.type === 'documents'
          ? [`files-${caseId}-all`]
          : []),
        ...(noteId || relevantFolder?.type === 'notes'
          ? [`notes-${caseId}-all`]
          : []),
        ...(isNotesPath || noteId ? [`notes-${caseId}-all`] : []),
        ...allFolderIds,
      ]);
      setExpandedInitialized(true);
    }
  }, [
    allFolderIds,
    caseId,
    cases.length,
    documentId,
    expandedInitialized,
    folderId,
    isNotesPath,
    noteId,
    relevantFolder,
    relevantFolder?.type,
  ]);

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

  const handleCaseNodesSelected = (event: Event, nodeIds: string[]) => {
    event.preventDefault();
    setCaseSelectedNodeIds(nodeIds);
  };

  const handleCaseNodesExpanded = (event: Event, nodeIds: string[]) => {
    event.preventDefault();
    setCaseExpandedNodeIds(nodeIds);
  };

  const handlePartnerNodesSelected = (
    event: SyntheticEvent<Element, Event>,
    nodeIds: string[],
  ) => {
    event.preventDefault();
    setPartnersSelectedNodeIds(nodeIds);
  };

  const handlePartnerNodesExpanded = (
    event: SyntheticEvent<Element, Event>,
    nodeIds: string[],
  ) => {
    event.preventDefault();
    setPartnerExpandedNodeIds(nodeIds);
  };
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
        <DrawerBody
          pages={pages}
          handleDrawerToggle={handleDrawerToggle}
          projects={cases}
          isCasesLoading={isCasesLoading}
          documentId={documentId}
          handleProjectNodesExpanded={handleCaseNodesExpanded}
          handleProjectNodesSelected={handleCaseNodesSelected}
          noteId={noteId}
          projectId={caseId}
          projectExpandedNodeIds={caseExpandedNodeIds}
          projectSelectedNodeIds={caseSelectedNodeIds}
          relevantFolder={relevantFolder}
          handlePartnerNodesExpanded={handlePartnerNodesExpanded}
          handlePartnerNodesSelected={handlePartnerNodesSelected}
          partnerExpandedNodeIds={partnerExpandedNodeIds}
          partnerSelectedNodeIds={partnerSelectedNodeIds}
          chatId={chatId}
        />
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
        <DrawerBody
          pages={pages}
          handleDrawerToggle={handleDrawerToggle}
          projects={cases}
          isCasesLoading={isCasesLoading}
          documentId={documentId}
          handleProjectNodesExpanded={handleCaseNodesExpanded}
          handleProjectNodesSelected={handleCaseNodesSelected}
          noteId={noteId}
          projectId={caseId}
          projectExpandedNodeIds={caseExpandedNodeIds}
          projectSelectedNodeIds={caseSelectedNodeIds}
          relevantFolder={relevantFolder}
          handlePartnerNodesExpanded={handlePartnerNodesExpanded}
          handlePartnerNodesSelected={handlePartnerNodesSelected}
          partnerExpandedNodeIds={partnerExpandedNodeIds}
          partnerSelectedNodeIds={partnerSelectedNodeIds}
        />
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
        toggleModalOpen={() =>
          toggleIsAddFolderModalOpen({
            folderId: relevantFolder?._id,
            caseId,
            type: relevantFolder?.type,
          })
        }
        open={isAddFolderModalOpen}
        type="document"
      />
      <AddDocumentModal
        toggleModalOpen={() =>
          toggleIsAddDocumentModalOpen({
            folderId: relevantFolder?._id,
            caseId,
          })
        }
        open={isAddDocumentModalOpen}
      />
    </Box>
  );
};
