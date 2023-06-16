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
import { TreeItem } from '@mui/lab';
import { styled } from 'styled-components';
import { LinkBehavior } from '../../utilities/LinkBehavior';
import { useCurrentPath } from '../../../hooks/useCurrentPath';
import { useGetCases } from '../../../queries/useGetCases';
import { useParams } from 'react-router-dom';

const StyledTreeItem = styled(TreeItem)`
  font-size: 12px;
  .MuiTreeItem-label {
    font-size: 0.8rem;
  }
  .MuiTreeItem-content {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 18px;
  }
`;

const containerStyles = {
  padding: { xs: '12px 6px', md: '48px' },
  flex: 1,
  // backgroundColor: 'var(--joy-palette-neutral-100, #EBEBEF)',
};

interface IPageProps {
  children: React.ReactNode;
}

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

export const Page: FC<IPageProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { chatId, caseId } = useParams();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    isLoading: isCasesLoading,
    data: casesData,
    error: casesError,
  } = useGetCases({ userId: '6483e65fd24b426cd772ce1c' });

  const paths = useCurrentPath();

  const currentPath = useMemo(() => {
    const base = paths[0].pathnameBase;
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
              {currentPath.includes(page.title.toLowerCase()) &&
                'cases' == page.title.toLowerCase() &&
                !!casesData.cases.length &&
                !isCasesLoading && (
                  <TreeView
                    aria-label="documents tree"
                    defaultCollapseIcon={<ArrowDropDown />}
                    defaultExpandIcon={<ArrowRight />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                    sx={{ pt: 0, pb: 0 }}
                  >
                    {casesData.cases.map((caseItem: any) => {
                      return (
                        <StyledTreeItem
                          key={`documents-${caseItem._id}`}
                          nodeId={caseItem._id}
                          label={caseItem.name}
                        >
                          <StyledTreeItem
                            key={`files-${caseItem._id}-all`}
                            nodeId={`files-${caseItem._id}-all`}
                            label="Your Files"
                          >
                            {caseItem.folders.map((folder: any) => {
                              return (
                                <StyledTreeItem
                                  key={folder._id}
                                  nodeId={folder._id}
                                  label={folder.name}
                                >
                                  {folder.folders.map((subFolder: any) => {
                                    return (
                                      <StyledTreeItem
                                        key={subFolder._id}
                                        nodeId={subFolder._id}
                                        label={subFolder.name}
                                      >
                                        {subFolder.documents.map(
                                          (document: any) => {
                                            return (
                                              <StyledTreeItem
                                                key={document._id}
                                                nodeId={document._id}
                                                label={document.name}
                                                icon={<ArticleOutlined />}
                                              />
                                            );
                                          },
                                        )}
                                      </StyledTreeItem>
                                    );
                                  })}
                                  {folder.documents.map((document: any) => {
                                    return (
                                      <StyledTreeItem
                                        key={document._id}
                                        nodeId={document._id}
                                        label={document.name}
                                        icon={<ArticleOutlined />}
                                      />
                                    );
                                  })}
                                </StyledTreeItem>
                              );
                            })}
                            {caseItem.documents.map((document: any) => {
                              return (
                                <StyledTreeItem
                                  key={document._id}
                                  nodeId={document._id}
                                  label={document.name}
                                  icon={<ArticleOutlined />}
                                />
                              );
                            })}
                          </StyledTreeItem>
                        </StyledTreeItem>
                      );
                    })}
                  </TreeView>
                )}
              {currentPath.includes(page.title.toLowerCase()) &&
                'Partner' == page.title &&
                !!casesData.cases.length &&
                !isCasesLoading && (
                  <TreeView
                    aria-label="documents tree"
                    defaultCollapseIcon={<ArrowDropDown />}
                    defaultExpandIcon={<ArrowRight />}
                    defaultEndIcon={<div style={{ width: 24 }} />}
                    defaultExpanded={[...(caseId ? [caseId] : [])]}
                    sx={{ pt: 0, pb: 0 }}
                  >
                    {casesData.cases.map((caseItem: any) => {
                      return (
                        <LinkBehavior
                          key={caseItem._id}
                          sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
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
                                  <LinkBehavior
                                    key={chat._id}
                                    sx={{
                                      textDecoration: 'none',
                                      color: 'inherit',
                                    }}
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
                                  </LinkBehavior>
                                );
                              })}
                            </StyledTreeItem>
                            <LinkBehavior
                              key={'generate-documents'}
                              sx={{
                                textDecoration: 'none',
                                color: 'inherit',
                              }}
                              href={`/partner/${caseItem._id}/generate`}
                            >
                              <StyledTreeItem
                                nodeId={`generate-documents-${caseItem._id}`}
                                label="Generate Documents"
                              >
                                {caseItem.generatedDocuments.map(
                                  (genDoc: any) => {
                                    return (
                                      <LinkBehavior
                                        key={'generated-documents'}
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
                                      </LinkBehavior>
                                    );
                                  },
                                )}
                              </StyledTreeItem>
                            </LinkBehavior>
                          </StyledTreeItem>
                        </LinkBehavior>
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
      caseId,
      casesData.cases,
      chatId,
      currentPath,
      handleDrawerToggle,
      isCasesLoading,
    ],
  );

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
        <Container maxWidth={false} sx={containerStyles}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};
