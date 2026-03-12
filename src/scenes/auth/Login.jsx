import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function Login({ setIsLogin }) {
  const nav = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    usernameOrEmail: "",
    password: "",
    remember: true,
  });

  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onToggleRemember = (e) =>
    setForm((p) => ({ ...p, remember: e.target.checked }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const username = form.usernameOrEmail.trim();
      const password = form.password || "";

      if (!username) throw new Error("Please enter your username or email");
      if (!password) throw new Error("Please enter your password");

      const body = new URLSearchParams();
      body.append("username", username);
      body.append("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          message = errorData?.detail || message;
        } catch {
          const text = await res.text();
          message = text || message;
        }
        throw new Error(message);
      }

      const data = await res.json();
      const token = data?.access_token;
      if (!token) {
        throw new Error("Login succeeded but no access_token returned");
      }

      const storage = form.remember ? localStorage : sessionStorage;
      const otherStorage = form.remember ? sessionStorage : localStorage;

      storage.setItem("token", token);
      storage.setItem(
        "user",
        JSON.stringify({
          usernameOrEmail: username,
        })
      );

      otherStorage.removeItem("token");
      otherStorage.removeItem("user");
      otherStorage.removeItem("mock_user");

      setIsLogin(true);
      nav(from, { replace: true });
    } catch (ex) {
      setErr(ex?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const darkFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.04) !important",
      boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
      transition: "all .18s ease",
    },
    "& .MuiOutlinedInput-input": {
      color: "#EAF2FF !important",
      fontWeight: 700,
      paddingTop: "14px",
      paddingBottom: "14px",
      backgroundColor: "transparent !important",
    },
    "& .MuiOutlinedInput-input::placeholder": {
      color: "rgba(180,200,235,0.55) !important",
      opacity: 1,
      fontWeight: 600,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.10) !important",
    },
    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(32,222,200,0.35) !important",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#20DEC8 !important",
      borderWidth: 2,
    },
    "& .MuiInputLabel-root": {
      color: "rgba(180,200,235,0.70)",
      fontWeight: 700,
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#20DEC8" },
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px rgba(14,22,40,1) inset !important",
      WebkitTextFillColor: "#EAF2FF !important",
      caretColor: "#EAF2FF !important",
      borderRadius: "999px",
      transition: "background-color 9999s ease-in-out 0s",
    },
    "& input:-webkit-autofill:hover": {
      WebkitBoxShadow: "0 0 0 1000px rgba(14,22,40,1) inset !important",
    },
    "& input:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 1000px rgba(14,22,40,1) inset !important",
    },
  };

  const pageBg =
    "radial-gradient(1200px 600px at 20% 10%, rgba(32, 222, 200, 0.10) 0%, transparent 60%), radial-gradient(900px 500px at 85% 30%, rgba(99, 102, 241, 0.12) 0%, transparent 55%), linear-gradient(180deg, #0B1220 0%, #070B14 100%)";

  const mutedText = "rgba(180,200,235,0.75)";
  const iconMuted = "rgba(180,200,235,0.70)";
  const teal = "#20DEC8";

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: { xs: 3, md: 0 },
        position: "relative",
        overflow: "hidden",
        background: pageBg,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.14,
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(32,222,200,0.35) 0 2px, transparent 2px),
            radial-gradient(circle at 80% 35%, rgba(99,102,241,0.28) 0 2px, transparent 2px),
            radial-gradient(circle at 85% 80%, rgba(255,255,255,0.12) 0 2px, transparent 2px)
          `,
          backgroundSize: "420px 320px",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.08)",
          top: -520,
          left: -420,
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          border: "2px solid rgba(32,222,200,0.06)",
          bottom: -720,
          right: -620,
          pointerEvents: "none",
        }}
      />

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1080,
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
          backgroundColor: "rgba(9, 14, 26, 0.72)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#0E1628",
            borderRadius: 6,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            minHeight: { xs: "auto", md: 560 },
          }}
        >
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={2.2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#EAF2FF",
                      lineHeight: 1.1,
                    }}
                  >
                    Sign in to continue
                  </Typography>
                  <Typography sx={{ mt: 0.8, color: mutedText, fontWeight: 600 }}>
                    Bank OCR Payment • Secure dashboard access
                  </Typography>
                </Box>
              </Box>

              {err && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 3,
                    backgroundColor: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#FFD6D6",
                    "& .MuiAlert-icon": { color: "#FF8A8A" },
                  }}
                >
                  {err}
                </Alert>
              )}

              <Stack component="form" spacing={2} onSubmit={onSubmit}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Username or Email"
                  value={form.usernameOrEmail}
                  onChange={onChange("usernameOrEmail")}
                  required
                  autoFocus
                  placeholder="Username or Email"
                  sx={darkFieldSx}
                  InputProps={{
                    sx: { borderRadius: 999 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" sx={{ color: iconMuted }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  variant="outlined"
                  fullWidth
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={onChange("password")}
                  required
                  placeholder="Password"
                  sx={darkFieldSx}
                  InputProps={{
                    sx: { borderRadius: 999 },
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" sx={{ color: iconMuted }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPw((v) => !v)}
                          edge="end"
                          aria-label="toggle password visibility"
                          sx={{
                            color: iconMuted,
                            "&:hover": { backgroundColor: "rgba(32,222,200,0.10)" },
                          }}
                        >
                          {showPw ? (
                            <VisibilityOffOutlinedIcon fontSize="small" />
                          ) : (
                            <VisibilityOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.remember}
                        onChange={onToggleRemember}
                        sx={{
                          color: "rgba(180,200,235,0.55)",
                          "&.Mui-checked": { color: teal },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ color: "rgba(215,230,255,0.85)", fontWeight: 700 }}>
                        Remember me
                      </Typography>
                    }
                  />

                  <Typography
                    sx={{
                      color: teal,
                      fontWeight: 900,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline", color: "#7CF7E7" },
                    }}
                    onClick={() => setErr("Forgot password is not implemented yet")}
                  >
                    Forgot password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 0.5,
                    borderRadius: 999,
                    py: 1.3,
                    fontWeight: 950,
                    textTransform: "none",
                    background: "linear-gradient(135deg, #20DEC8 0%, #2DA2FF 100%)",
                    color: "#07121C",
                    boxShadow: "0 18px 45px rgba(32,222,200,0.22)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #18CDB8 0%, #2293F0 100%)",
                      boxShadow: "0 18px 55px rgba(32,222,200,0.28)",
                    },
                    "&.Mui-disabled": {
                      background: "rgba(255,255,255,0.10)",
                      color: "rgba(234,242,255,0.55)",
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CircularProgress size={18} sx={{ color: "#07121C" }} />
                      Signing in...
                    </Box>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                <Divider sx={{ my: 0.5, borderColor: "rgba(255,255,255,0.08)" }} />

                <Typography sx={{ textAlign: "center", color: mutedText, fontWeight: 600 }}>
                  New here?{" "}
                  <Box
                    component={Link}
                    to="/register"
                    sx={{
                      fontWeight: 950,
                      color: teal,
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline", color: "#7CF7E7" },
                    }}
                  >
                    Create an account
                  </Box>
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 5 },
              display: { xs: "flex", md: "grid" },
              placeItems: "center",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
              position: "relative",
              overflow: "hidden",
              borderLeft: { xs: "none", md: "1px solid rgba(255,255,255,0.08)" },
              borderTop: { xs: "1px solid rgba(255,255,255,0.08)", md: "none" },
            }}
          >
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                  boxShadow: "0 18px 55px rgba(245, 158, 11, 0.28)",
                }}
              >
                <DocumentScannerOutlinedIcon sx={{ fontSize: 44, color: "white" }} />
              </Box>

              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  }}
                >
                  <AccountBalanceOutlinedIcon sx={{ color: "#2DA2FF" }} />
                </Box>

                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  }}
                >
                  <VerifiedUserOutlinedIcon sx={{ color: teal }} />
                </Box>

                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  }}
                >
                  <ReceiptLongOutlinedIcon sx={{ color: "#FF5DB1" }} />
                </Box>
              </Box>

              <Box sx={{ textAlign: "center", px: 2 }}>
                <Typography sx={{ fontWeight: 950, color: "#EAF2FF" }}>
                  OCR • Extract • Analyze
                </Typography>
                <Typography sx={{ mt: 0.5, color: mutedText, fontWeight: 600 }}>
                  Convert transfer slips into structured data for your dashboard.
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: { xs: "none", md: "grid" },
                placeItems: "center",
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  width: 360,
                  height: 360,
                  borderRadius: "50%",
                  border: "10px solid rgba(255,255,255,0.06)",
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  width: 270,
                  height: 270,
                  borderRadius: "50%",
                  border: "2px dashed rgba(32,222,200,0.22)",
                }}
              />

              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                  boxShadow: "0 18px 55px rgba(245, 158, 11, 0.28)",
                  zIndex: 2,
                }}
              >
                <DocumentScannerOutlinedIcon sx={{ fontSize: 52, color: "white" }} />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  left: "18%",
                  top: "30%",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  zIndex: 2,
                }}
              >
                <AccountBalanceOutlinedIcon sx={{ color: "#2DA2FF" }} />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  right: "18%",
                  top: "34%",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  zIndex: 2,
                }}
              >
                <ReceiptLongOutlinedIcon sx={{ color: "#FF5DB1" }} />
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  left: "34%",
                  bottom: "22%",
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                  zIndex: 2,
                }}
              >
                <VerifiedUserOutlinedIcon sx={{ color: teal }} />
              </Box>

              <Box sx={{ position: "absolute", bottom: 34, textAlign: "center", px: 2 }}>
                <Typography sx={{ fontWeight: 950, color: "#EAF2FF" }}>
                  OCR • Extract • Analyze
                </Typography>
                <Typography sx={{ mt: 0.5, color: mutedText, fontWeight: 600 }}>
                  Convert transfer slips into structured data for your dashboard.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}