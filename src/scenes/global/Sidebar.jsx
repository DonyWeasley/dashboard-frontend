import { useState } from "react";
import { Sidebar, Menu, MenuItem, ProSidebarProvider } from "react-pro-sidebar";
import { Box, Typography, useTheme, Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const AppSidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .ps-sidebar-container": {
          background: `${colors.primary[400]} !important`,
        },
      }}
    >
      <ProSidebarProvider>
        <Sidebar
          collapsed={isCollapsed}
          width="280px"
          collapsedWidth="80px"
          style={{ height: "100vh" }}
        >
          <Menu>
            {/* TOGGLE */}
            <MenuItem
              icon={<MenuOutlinedIcon />}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {!isCollapsed && (
                <Typography variant="h3" color={colors.grey[100]}>
                  ADMINIS
                </Typography>
              )}
            </MenuItem>

            {/* ===== PROFILE SECTION ===== */}
            {!isCollapsed && (
              <Box mb={2} textAlign="center">
                <Avatar
                  src="/assets/user.png" // เปลี่ยนเป็นรูปจริงได้
                  sx={{
                    width: 90,
                    height: 90,
                    margin: "0 auto",
                    mb: 1,
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight="600"
                  color={colors.grey[100]}
                >
                  Dony
                </Typography>
                <Typography
                  variant="body2"
                  color={colors.greenAccent[400]}
                >
                  User
                </Typography>
              </Box>
            )}
            {/* ============================ */}

            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
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
            />

            <Item
              title="Transactions"
              to="/transactions"
              icon={<ReceiptLongOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Statistical information"
              to="/invoices"
              icon={<AnalyticsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
    </Box>
  );
};

export default AppSidebar;
