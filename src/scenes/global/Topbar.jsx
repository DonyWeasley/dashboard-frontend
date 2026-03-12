import { Box, IconButton, useTheme, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import InputBase from "@mui/material/InputBase";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchIcon from "@mui/icons-material/Search";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const Topbar = ({ setIsLogin, isMobile = false, onOpenSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("mock_user");

    setIsLogin(false);
    navigate("/login");
  };

  return (
    <>
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
          {/* LEFT */}
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
              <IconButton type="button" sx={{ p: 1 }}>
                <SearchIcon />
              </IconButton>
            </Box>
          </Box>

          {/* RIGHT */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.25,
              flexShrink: 0,
            }}
          >
            {!isMobile && (
              <Tooltip title="Profile" arrow>
                <IconButton onClick={() => navigate("/form")}>
                  <AccountCircleOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Theme" arrow>
              <IconButton onClick={colorMode.toggleColorMode}>
                {theme.palette.mode === "dark" ? (
                  <DarkModeOutlinedIcon />
                ) : (
                  <LightModeOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Logout" arrow>
              <IconButton onClick={() => setOpenLogoutDialog(true)}>
                <LogoutOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Dialog
  open={openLogoutDialog}
  onClose={() => setOpenLogoutDialog(false)}
  fullWidth
  maxWidth="xs"
  PaperProps={{
    sx: {
      borderRadius: "18px",
      backgroundColor: colors.primary[400],
      border: `1px solid ${colors.primary[500]}`,
      boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
      overflow: "hidden",
    },
  }}
>
  <DialogTitle
    sx={{
      px: 3,
      py: 2.25,
      background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`,
      borderBottom: `1px solid ${colors.primary[500]}`,
    }}
  >
    <Box display="flex" alignItems="center" gap={1.2}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          backgroundColor: "rgba(255,255,255,0.06)",
          color: colors.redAccent[300],
        }}
      >
        <LogoutOutlinedIcon fontSize="small" />
      </Box>

      <Box>
        <Box
          sx={{
            color: colors.grey[100],
            fontWeight: 800,
            fontSize: 19,
            lineHeight: 1.2,
          }}
        >
          Confirm Logout
        </Box>
        <Box
          sx={{
            color: colors.grey[300],
            fontSize: 13,
            mt: 0.25,
          }}
        >
          You are about to sign out from your account
        </Box>
      </Box>
    </Box>
  </DialogTitle>

  <DialogContent
    dividers
    sx={{
      px: 3,
      py: 3,
      backgroundColor: colors.primary[400],
      borderColor: colors.primary[500],
    }}
  >
    <Box
      sx={{
        p: 2,
        borderRadius: "14px",
        backgroundColor: colors.primary[500],
        border: `1px solid ${colors.primary[600] || colors.primary[500]}`,
      }}
    >
      <Box
        sx={{
          color: colors.grey[200],
          lineHeight: 1.75,
          fontSize: 14,
        }}
      >
        Are you sure you want to logout?
      </Box>

      <Box
        sx={{
          mt: 1,
          fontSize: 13,
          color: colors.grey[400],
        }}
      >
        You will need to login again to access your dashboard and settings.
      </Box>
    </Box>
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      py: 2,
      backgroundColor: colors.primary[400],
      borderTop: `1px solid ${colors.primary[500]}`,
      gap: 1,
    }}
  >
    <Button
      onClick={() => setOpenLogoutDialog(false)}
      sx={{
        textTransform: "none",
        fontWeight: 700,
        color: colors.grey[300],
        borderRadius: "10px",
        px: 2,
      }}
    >
      Cancel
    </Button>

    <Button
      color="error"
      variant="contained"
      onClick={handleLogout}
      startIcon={<LogoutOutlinedIcon fontSize="small" />}
      sx={{
        minWidth: 120,
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 800,
        boxShadow: "none",
      }}
    >
      Logout
    </Button>
  </DialogActions>
</Dialog>
    </>
  );
};

export default Topbar;