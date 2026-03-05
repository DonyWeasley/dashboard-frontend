import { useState } from "react";
import { Sidebar, Menu, MenuItem, ProSidebarProvider } from "react-pro-sidebar";
import { Box, Typography, useTheme, Avatar, Drawer } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 80;

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

  const [selected, setSelected] = useState("Dashboard");

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
            {/* TOGGLE */}
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
                <Avatar
                  src="/assets/user.png"
                  sx={{ width: 90, height: 90, margin: "0 auto", mb: 1 }}
                />
                <Typography variant="h6" fontWeight="600" color={colors.grey[100]}>
                  Dony
                </Typography>
                <Typography variant="body2" color={colors.greenAccent[400]}>
                  User
                </Typography>
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
              title="Attached transfer slip"
              to="/slip-upload"
              icon={<DocumentScannerOutlinedIcon />}
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

  // ✅ ย้าย state มาไว้ที่นี่ เพื่อให้ "กล่องครอบ" เปลี่ยน width ตาม
  const [isCollapsed, setIsCollapsed] = useState(false);

  // mobile ไม่ต้อง collapsed
  const collapsed = isMobile ? false : isCollapsed;

  // ✅ MOBILE: Drawer
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

  // ✅ DESKTOP: hide sidebar entirely
  if (!isSidebar) return null;

  // ✅ DESKTOP: wrapper width เปลี่ยนตาม collapsed
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