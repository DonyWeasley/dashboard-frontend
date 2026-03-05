import { Box, IconButton, useTheme, Tooltip } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchIcon from "@mui/icons-material/Search";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const Topbar = ({ setIsLogin, isMobile = false, onOpenSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const handleLogout = () => {
   
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

  
    localStorage.removeItem("mock_user");

    setIsLogin(false);
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: theme.zIndex.appBar,
        backgroundColor: colors.primary[600],
        borderBottom: `1px solid ${colors.primary[500]}`,
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.25,
          flexWrap: "nowrap",
        }}
      >
        
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
         
          {isMobile && (
            <Tooltip title="Menu" arrow>
              <IconButton
                onClick={onOpenSidebar}
                sx={{
                  backgroundColor: colors.primary[400],
                  borderRadius: 2,
                  "&:hover": { backgroundColor: colors.primary[500] },
                  flexShrink: 0,
                }}
              >
                <MenuOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}

         
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: colors.primary[400],
              borderRadius: 2,
              px: 1,
              height: 40,
              flex: 1,
              minWidth: 0,
              maxWidth: { xs: "100%", md: 460 },
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1, minWidth: 0, color: colors.grey[100] }}
              placeholder="Search"
              inputProps={{ "aria-label": "search" }}
            />
            <IconButton type="button" sx={{ p: 1 }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Box>
        </Box>

      
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.25,
            flexShrink: 0,
          }}
        >
          <Tooltip title="Theme" arrow>
            <IconButton onClick={colorMode.toggleColorMode} aria-label="toggle theme">
              {theme.palette.mode === "dark" ? (
                <DarkModeOutlinedIcon />
              ) : (
                <LightModeOutlinedIcon />
              )}
            </IconButton>
          </Tooltip>

       
          {!isMobile && (
            <Tooltip title="Notifications" arrow>
              <IconButton aria-label="notifications">
                <NotificationsOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}

          {!isMobile && (
            <Tooltip title="Settings" arrow>
              <IconButton aria-label="settings">
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Logout" arrow>
            <IconButton onClick={handleLogout} aria-label="logout">
              <LogoutOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default Topbar;