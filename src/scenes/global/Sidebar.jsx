import { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem, ProSidebarProvider } from "react-pro-sidebar";
import {
  Box,
  Typography,
  useTheme,
  Avatar,
  Drawer,
  CircularProgress,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { tokens } from "../../theme";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { BiSolidPhotoAlbum } from "react-icons/bi";
import { LuGoal } from "react-icons/lu";

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 80;
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token") ||
  "";

const Item = ({ title, to, icon, selected, setSelected, onSelect }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => {
        setSelected(title);
        onSelect?.();
      }}
      icon={icon}
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const SidebarContent = ({
  onClose,
  isMobile,
  collapsed,
  onToggleCollapsed,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const location = useLocation();

  const getSelectedFromPath = (pathname) => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/goal")) return "Goal";
    if (pathname.startsWith("/slip-upload")) return "Attached slip";
    if (pathname.startsWith("/finance/categories")) return "Album Categories";
    if (pathname.startsWith("/transactions")) return "Transactions";
    if (pathname.startsWith("/invoices")) return "Statistical information";
    return "Dashboard";
  };

  const [selected, setSelected] = useState(
    getSelectedFromPath(location.pathname),
  );
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userInfo, setUserInfo] = useState({
    displayName: "User",
    role: "User",
    profileImageUrl: "",
  });

  useEffect(() => {
    setSelected(getSelectedFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);

      try {
        const token = getToken();

        const res = await fetch(`${API_BASE}/profile/`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const text = await res.text();
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

        const data = text ? JSON.parse(text) : {};

        setUserInfo({
          displayName: data?.display_name || data?.username || "User",
          role: "User",
          profileImageUrl: data?.profile_image_url
            ? `${API_BASE}${data.profile_image_url}`
            : "",
        });
      } catch (error) {
        console.error("Failed to load sidebar profile:", error);
        setUserInfo({
          displayName: "User",
          role: "User",
          profileImageUrl: "",
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      onClose?.();
      return;
    }
    onToggleCollapsed?.();
  };

  return (
    <Box
      sx={{
        height: "100%",
        "& .ps-sidebar-container": {
          background: `${colors.primary[400]} !important`,
        },
        "& .ps-menu-button:hover": {
          backgroundColor: `${colors.primary[500]} !important`,
        },
        "& .ps-menu-button.ps-active": {
          backgroundColor: `${colors.primary[500]} !important`,
        },
      }}
    >
      <ProSidebarProvider>
        <Sidebar
          collapsed={collapsed}
          width={`${DRAWER_WIDTH}px`}
          collapsedWidth={`${COLLAPSED_WIDTH}px`}
          style={{ height: "100%" }}
        >
          <Menu>
            <MenuItem
              icon={<MenuOutlinedIcon />}
              onClick={handleToggle}
              style={{ color: colors.grey[100] }}
            >
              {!collapsed && (
                <Typography variant="h3" color={colors.grey[100]}>
                  DERS-OCR
                </Typography>
              )}
            </MenuItem>

            {!collapsed && (
              <Box mb={2} textAlign="center" sx={{ px: 2 }}>
                {loadingProfile ? (
                  <Box
                    sx={{
                      minHeight: 150,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                    }}
                  >
                    <CircularProgress size={26} />
                    <Typography variant="body2" color={colors.grey[300]}>
                      Loading profile...
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Avatar
                      src={userInfo.profileImageUrl || "/assets/user.png"}
                      alt={userInfo.displayName}
                      sx={{ width: 90, height: 90, margin: "0 auto", mb: 1 }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight="600"
                      color={colors.grey[100]}
                    >
                      {userInfo.displayName || "User"}
                    </Typography>
                    <Typography variant="body2" color={colors.greenAccent[400]}>
                      {userInfo.role}
                    </Typography>
                  </>
                )}
              </Box>
            )}

            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              onSelect={isMobile ? onClose : undefined}
            />

            <Typography sx={{ m: "15px 0 5px 20px" }} color={colors.grey[300]}>
              Menu
            </Typography>

            <Item
              title="Goal"
              to="/goal"
              icon={<LuGoal />}
              selected={selected}
              setSelected={setSelected}
              onSelect={isMobile ? onClose : undefined}
            />

            <Item
              title="Attached transfer slip"
              to="/slip-upload"
              icon={<DocumentScannerOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              onSelect={isMobile ? onClose : undefined}
            />

            <Item
              title="Album Categories"
              to="/finance/categories"
              icon={<BiSolidPhotoAlbum />}
              selected={selected}
              setSelected={setSelected}
              onSelect={isMobile ? onClose : undefined}
            />

            <Item
              title="Transactions"
              to="/transactions"
              icon={<ReceiptLongOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              onSelect={isMobile ? onClose : undefined}
            />

            <Item
              title="Statistical information"
              to="/invoices"
              icon={<AnalyticsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              onSelect={isMobile ? onClose : undefined}
            />
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
    </Box>
  );
};

const AppSidebar = ({
  isMobile = false,
  mobileOpen = false,
  onMobileClose,
  isSidebar = true,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const collapsed = isMobile ? false : isCollapsed;

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            backgroundColor: colors.primary[400],
            borderRight: `1px solid ${colors.primary[500]}`,
          },
        }}
      >
        <SidebarContent onClose={onMobileClose} isMobile collapsed={false} />
      </Drawer>
    );
  }

  if (!isSidebar) return null;

  const sidebarW = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box
      sx={{
        width: sidebarW,
        height: "100dvh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        borderRight: `1px solid ${colors.primary[500]}`,
        transition: "width .25s ease",
        overflow: "hidden",
      }}
    >
      <SidebarContent
        isMobile={false}
        collapsed={collapsed}
        onToggleCollapsed={() => setIsCollapsed((v) => !v)}
      />
    </Box>
  );
};

export default AppSidebar;