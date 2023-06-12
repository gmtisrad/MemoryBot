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
  Article,
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
  padding: '48px ',
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
    () => (isSmallScreen ? '180px' : '240px'),
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
                          key={caseItem._id}
                          nodeId={caseItem._id}
                          label={caseItem.name}
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
                            console.log({ document });
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
                  </TreeView>
                )}
            </ListItem>
          ))}
        </List>
      </div>
    ),
    [casesData.cases, currentPath, handleDrawerToggle, isCasesLoading],
  );

  return (
    <Box id="page-wrapper" sx={boxStyles}>
      <Drawer
        sx={{
          display: { xs: 'none', sm: 'block' },
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
