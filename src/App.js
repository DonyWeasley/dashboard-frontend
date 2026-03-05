import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider, Container, useMediaQuery } from "@mui/material";

import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

import Dashboard from "./scenes/dashboard";
import SlipUpload from "./scenes/slipUpload";
import SlipResult from "./scenes/slipUpload/SlipResult";
import Invoices from "./scenes/invoices";
import Transactions from "./scenes/transactions";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar/calendar";

import Login from "./scenes/auth/Login";
import Register from "./scenes/auth/Register";

import { ColorModeContext, useMode } from "./theme";

function App() {
  const [theme, colorMode] = useMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

 
  const [isSidebar, setIsSidebar] = useState(true);

 
  const [mobileOpen, setMobileOpen] = useState(false);

 
  useEffect(() => {
    
    setMobileOpen(false);

    
    if (isMobile) {
      setIsSidebar(false);
    } else {
      setIsSidebar(true);
    }
  }, [isMobile]);

  const [isLogin, setIsLogin] = useState(Boolean(localStorage.getItem("mock_user")));

  
  const AppLayout = ({ children }) => (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Sidebar
        isSidebar={isSidebar}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Topbar
          isMobile={isMobile}
          setIsLogin={setIsLogin}
          
          setIsSidebar={setIsSidebar}
         
          onOpenSidebar={() => setMobileOpen(true)}
        />

        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3 } }}>
          <Container maxWidth="xl" disableGutters>
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );


  const AuthLayout = ({ children }) => <Box sx={{ minHeight: "100dvh" }}>{children}</Box>;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
          {/* ===== Auth routes ===== */}
          {!isLogin && (
            <>
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <Login setIsLogin={setIsLogin} />
                  </AuthLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthLayout>
                    <Register />
                  </AuthLayout>
                }
              />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}

          {/* ===== App routes ===== */}
          {isLogin && (
            <>
              <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
              <Route path="/slip-upload" element={<AppLayout><SlipUpload /></AppLayout>} />
              <Route path="/slip/result" element={<AppLayout><SlipResult /></AppLayout>} />
              <Route path="/transactions" element={<AppLayout><Transactions /></AppLayout>} />
              <Route path="/invoices" element={<AppLayout><Invoices /></AppLayout>} />
              <Route path="/form" element={<AppLayout><Form /></AppLayout>} />
              <Route path="/bar" element={<AppLayout><Bar /></AppLayout>} />
              <Route path="/pie" element={<AppLayout><Pie /></AppLayout>} />
              <Route path="/line" element={<AppLayout><Line /></AppLayout>} />
              <Route path="/faq" element={<AppLayout><FAQ /></AppLayout>} />
              <Route path="/calendar" element={<AppLayout><Calendar /></AppLayout>} />
              <Route path="/geography" element={<AppLayout><Geography /></AppLayout>} />

              {}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />

              {/* fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;