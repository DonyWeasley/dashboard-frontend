import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  Container,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";

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
import AlbumCategoryPage from "./albumCategory/AlbumCategory";
import CategoryDetailPage from "./albumCategory/CategoryDetail";
import GoalPage from "./goal/GoalPage";
import GoalPopup from "./goal/GoalPopup";

import { ColorModeContext, useMode } from "./theme";

function App() {
  const [theme, colorMode] = useMode();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const [isSidebar, setIsSidebar] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isLogin, setIsLogin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setMobileOpen(false);

    if (isMobile) {
      setIsSidebar(false);
    } else {
      setIsSidebar(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    setIsLogin(Boolean(token));
    setAuthChecked(true);
  }, []);

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

  const AuthLayout = ({ children }) => (
    <Box sx={{ minHeight: "100dvh" }}>{children}</Box>
  );

  const ProtectedRoute = ({ children }) => {
    if (!isLogin) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return <AppLayout>{children}</AppLayout>;
  };

  const GuestRoute = ({ children }) => {
    if (isLogin) {
      return <Navigate to="/" replace />;
    }
    return <AuthLayout>{children}</AuthLayout>;
  };

  if (!authChecked) {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: "100dvh",
              display: "grid",
              placeItems: "center",
              backgroundColor: theme.palette.background.default,
            }}
          >
            <CircularProgress />
          </Box>
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Routes>
          {/* Public / Guest only */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login setIsLogin={setIsLogin} />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Protected */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slip-upload"
            element={
              <ProtectedRoute>
                <SlipUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/slip/result"
            element={
              <ProtectedRoute>
                <SlipResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/form"
            element={
              <ProtectedRoute>
                <Form />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bar"
            element={
              <ProtectedRoute>
                <Bar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pie"
            element={
              <ProtectedRoute>
                <Pie />
              </ProtectedRoute>
            }
          />
          <Route
            path="/line"
            element={
              <ProtectedRoute>
                <Line />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/geography"
            element={
              <ProtectedRoute>
                <Geography />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/categories"
            element={
              <ProtectedRoute>
                <AlbumCategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance/categories/:category"
            element={
              <ProtectedRoute>
                <CategoryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goal"
            element={
              <ProtectedRoute>
                <GoalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goalpopup"
            element={
              <ProtectedRoute>
                <GoalPopup />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={isLogin ? "/" : "/login"} replace />}
          />
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;