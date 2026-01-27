import { useMemo, useState } from "react";
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
  useTheme,
  Chip,
  Tooltip,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import { tokens } from "../../theme";

export default function Register() {
  const nav = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    setErr("");

    try {
      const name = form.name.trim();
      const email = form.email.trim().toLowerCase();
      const password = form.password || "";
      const confirm = form.confirmPassword || "";

      if (!name) throw new Error("Please enter your name");
      if (!email) throw new Error("Please enter your email");

      // ✅ ถ้าเริ่มกรอกรหัสผ่านแล้ว ต้องให้ตรงกัน
      if ((password || confirm) && password !== confirm) {
        throw new Error("Passwords do not match");
      }

      const accounts = JSON.parse(localStorage.getItem("mock_accounts") || "[]");
      const exists = accounts.some((a) => a.email === email);
      if (exists) throw new Error("This email is already registered");

      accounts.push({
        name,
        email,
        password, // mock
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("mock_accounts", JSON.stringify(accounts));
      nav("/login");
    } catch (ex) {
      setErr(ex?.message || "Register failed");
    }
  };

  const textFieldSx = useMemo(
    () => ({
      "& .MuiInputBase-root": {
        borderRadius: 2.2,
        backgroundColor: `${colors.primary[400]}cc`,
        color: colors.grey[100],
        backdropFilter: "blur(10px)",
      },
      "& .MuiInputBase-input": { py: 1.35 },
      "& .MuiInputBase-input::placeholder": {
        color: colors.grey[400],
        opacity: 1,
      },
      "& .MuiInputLabel-root": { color: colors.grey[300] },
      "& .MuiInputLabel-root.Mui-focused": { color: colors.greenAccent[400] },
      "& .MuiOutlinedInput-notchedOutline": { borderColor: `${colors.primary[500]}aa` },
      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: `${colors.greenAccent[500]}`,
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: `${colors.greenAccent[500]}`,
        borderWidth: 2,
      },
      "& .MuiSvgIcon-root": { color: colors.grey[300] },
    }),
    [colors]
  );

  const featureCardSx = {
    borderRadius: 2.5,
    p: 2,
    border: `1px solid ${colors.primary[500]}66`,
    background: `linear-gradient(135deg, ${colors.primary[400]}aa 0%, ${colors.primary[500]}66 100%)`,
    backdropFilter: "blur(10px)",
    boxShadow: "0 14px 40px rgba(0,0,0,0.16)",
  };

  const mismatch = !!(form.password || form.confirmPassword) && form.password !== form.confirmPassword;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 2,
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(1200px 500px at 20% 15%, ${colors.greenAccent[500]}22 0%, transparent 60%),
                     radial-gradient(900px 450px at 85% 15%, ${
                       colors.blueAccent?.[500] ? colors.blueAccent[500] : colors.greenAccent[500]
                     }18 0%, transparent 55%),
                     linear-gradient(180deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`,
      }}
    >
      {/* subtle grid pattern overlay */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage: `
            linear-gradient(${colors.primary[500]} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.primary[500]} 1px, transparent 1px)
          `,
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(700px 420px at 50% 25%, #000 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* glow blobs */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          width: 520,
          height: 520,
          left: -120,
          top: -140,
          borderRadius: "50%",
          background: `${colors.greenAccent[500]}22`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          width: 560,
          height: 560,
          right: -160,
          bottom: -160,
          borderRadius: "50%",
          background: `${colors.primary[400]}55`,
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1040,
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${colors.primary[500]}66`,
          backgroundColor: `${colors.primary[400]}cc`,
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            minHeight: { xs: "auto", md: 600 },
          }}
        >
          {/* LEFT: Hero */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              position: "relative",
              borderRight: { xs: "none", md: `1px solid ${colors.primary[500]}66` },
              background: `linear-gradient(135deg, ${colors.primary[500]}66 0%, ${colors.primary[600]}22 100%)`,
            }}
          >
            <Stack spacing={2.3}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Stack spacing={0.6}>
                  <Typography variant="h4" fontWeight={950} color={colors.grey[100]} lineHeight={1.15}>
                    Create your account
                  </Typography>
                  <Typography variant="body2" color={colors.grey[200]} sx={{ opacity: 0.88 }}>
                    Start using OCR Bank Payment in minutes.
                  </Typography>
                </Stack>

                <Chip
                  icon={<AutoAwesomeOutlinedIcon />}
                  label="Mock Register"
                  sx={{
                    fontWeight: 900,
                    px: 0.8,
                    borderRadius: 999,
                    backgroundColor: `${colors.greenAccent[500]}22`,
                    color: colors.greenAccent[400],
                    border: `1px solid ${colors.greenAccent[500]}55`,
                    "& .MuiChip-icon": { color: colors.greenAccent[400] },
                  }}
                />
              </Box>

              {/* trust chips */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<ShieldOutlinedIcon />}
                  label="Saved locally"
                  sx={{
                    borderRadius: 999,
                    backgroundColor: `${colors.primary[500]}55`,
                    color: colors.grey[100],
                    border: `1px solid ${colors.primary[500]}66`,
                    "& .MuiChip-icon": { color: colors.greenAccent[400] },
                  }}
                />
                <Chip
                  icon={<BoltOutlinedIcon />}
                  label="Fast setup"
                  sx={{
                    borderRadius: 999,
                    backgroundColor: `${colors.primary[500]}55`,
                    color: colors.grey[100],
                    border: `1px solid ${colors.primary[500]}66`,
                    "& .MuiChip-icon": { color: colors.greenAccent[400] },
                  }}
                />
                <Chip
                  icon={<CloudOutlinedIcon />}
                  label="Ready for backend"
                  sx={{
                    borderRadius: 999,
                    backgroundColor: `${colors.primary[500]}55`,
                    color: colors.grey[100],
                    border: `1px solid ${colors.primary[500]}66`,
                    "& .MuiChip-icon": { color: colors.greenAccent[400] },
                  }}
                />
              </Stack>

              {/* feature cards */}
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Box sx={featureCardSx}>
                  <Typography fontWeight={900} color={colors.grey[100]}>
                    ✅ One account, all slips
                  </Typography>
                  <Typography variant="body2" color={colors.grey[200]} sx={{ opacity: 0.88, mt: 0.5 }}>
                    Keep your uploads and results organized under your profile.
                  </Typography>
                </Box>

                <Box sx={featureCardSx}>
                  <Typography fontWeight={900} color={colors.grey[100]}>
                    ✅ Smooth demo experience
                  </Typography>
                  <Typography variant="body2" color={colors.grey[200]} sx={{ opacity: 0.88, mt: 0.5 }}>
                    Perfect for showcasing UI/UX while backend is still in progress.
                  </Typography>
                </Box>

                <Box sx={featureCardSx}>
                  <Typography fontWeight={900} color={colors.grey[100]}>
                    ✅ Upgrade later
                  </Typography>
                  <Typography variant="body2" color={colors.grey[200]} sx={{ opacity: 0.88, mt: 0.5 }}>
                    You can replace localStorage with real API anytime.
                  </Typography>
                </Box>
              </Stack>

              <Box
                sx={{
                  mt: 0.5,
                  p: 2,
                  borderRadius: 2.5,
                  border: `1px dashed ${colors.primary[500]}aa`,
                  backgroundColor: `${colors.primary[500]}33`,
                }}
              >
                <Typography variant="body2" color={colors.grey[200]} sx={{ opacity: 0.95 }}>
                  Tip: If you set a password, confirm it to avoid typos.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* RIGHT: Form */}
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.2}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="h6" fontWeight={950} color={colors.grey[100]}>
                  Register
                </Typography>

                <Tooltip title="Frontend-only mock register (localStorage)" arrow>
                  <Chip
                    icon={<InfoOutlinedIcon />}
                    label="Demo mode"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      backgroundColor: `${colors.greenAccent[500]}18`,
                      color: colors.greenAccent[400],
                      border: `1px solid ${colors.greenAccent[500]}55`,
                      "& .MuiChip-icon": { color: colors.greenAccent[400] },
                    }}
                  />
                </Tooltip>
              </Box>

              {err && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: `${colors.redAccent[700]}22`,
                    color: colors.grey[100],
                    border: `1px solid ${colors.redAccent[700]}55`,
                    "& .MuiAlert-icon": { color: colors.redAccent[500] },
                  }}
                >
                  {err}
                </Alert>
              )}

              <Stack component="form" spacing={2} onSubmit={onSubmit}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={onChange("name")}
                  required
                  placeholder="Your name"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Email"
                  value={form.email}
                  onChange={onChange("email")}
                  required
                  placeholder="name@example.com"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Password (mock)"
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={onChange("password")}
                  placeholder="••••••••"
                  sx={textFieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPw((v) => !v)}
                          edge="end"
                          aria-label="toggle password visibility"
                          sx={{
                            color: colors.grey[300],
                            "&:hover": { backgroundColor: `${colors.primary[500]}66` },
                          }}
                        >
                          {showPw ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Confirm Password (mock)"
                  type={showConfirmPw ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={onChange("confirmPassword")}
                  placeholder="••••••••"
                  sx={{
                    ...textFieldSx,
                    ...(mismatch
                      ? {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: `${colors.redAccent[500]}cc`,
                          },
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: `${colors.redAccent[500]}`,
                          },
                        }
                      : {}),
                  }}
                  error={mismatch}
                  helperText={mismatch ? "Passwords do not match" : " "}
                  FormHelperTextProps={{
                    sx: { color: mismatch ? colors.redAccent[300] : `${colors.grey[400]}cc` },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPw((v) => !v)}
                          edge="end"
                          aria-label="toggle confirm password visibility"
                          sx={{
                            color: colors.grey[300],
                            "&:hover": { backgroundColor: `${colors.primary[500]}66` },
                          }}
                        >
                          {showConfirmPw ? (
                            <VisibilityOffOutlinedIcon fontSize="small" />
                          ) : (
                            <VisibilityOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={mismatch}
                  sx={{
                    borderRadius: 2.2,
                    py: 1.2,
                    fontWeight: 950,
                    textTransform: "none",
                    backgroundColor: colors.greenAccent[500],
                    color: colors.primary[900],
                    boxShadow: "0 14px 40px rgba(0,0,0,0.18)",
                    "&:hover": { backgroundColor: colors.greenAccent[400] },
                    "&.Mui-disabled": {
                      backgroundColor: `${colors.primary[500]}aa`,
                      color: `${colors.grey[300]}cc`,
                    },
                  }}
                >
                  Create account
                </Button>

                <Divider sx={{ borderColor: `${colors.primary[500]}aa`, opacity: 0.9 }} />

                <Typography variant="body2" textAlign="center" color={colors.grey[200]}>
                  Already have an account?{" "}
                  <Box
                    component={Link}
                    to="/login"
                    sx={{
                      fontWeight: 950,
                      color: colors.greenAccent[400],
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    Login
                  </Box>
                </Typography>

                <Typography
                  variant="caption"
                  sx={{ opacity: 0.78, lineHeight: 1.6 }}
                  textAlign="center"
                  color={colors.grey[300]}
                >
                  * Frontend-only mock register: saved in your browser (localStorage).
                  <br />
                  Password is optional in demo mode (but if you type it, confirm must match).
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}