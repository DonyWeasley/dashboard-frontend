import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Box,
  useTheme,
} from "@mui/material";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import { tokens } from "../theme";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

function monthKeyNow() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function GoalPopup({ open, onClose, onSaved }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const token = useMemo(
    () =>
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token"),
    []
  );

  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const month = monthKeyNow();

  useEffect(() => {
    if (open) {
      setAmount("");
      setError("");
    }
  }, [open]);

  const save = async () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("กรุณากรอก goal เป็นตัวเลขมากกว่า 0");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/goals/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ month, amount: n }),
      });

      if (!res.ok) throw new Error(await res.text());

      onSaved?.();
      onClose?.();
    } catch (e) {
      setError(e?.message || "Save goal failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
          <TrackChangesOutlinedIcon sx={{ color: colors.greenAccent[400] }} />
          <Box>
            <Typography
              sx={{
                color: colors.grey[100],
                fontWeight: 800,
                fontSize: { xs: 18, sm: 20 },
                lineHeight: 1.2,
              }}
            >
              ตั้ง Goal ประจำเดือน
            </Typography>
            <Typography
              sx={{
                color: colors.grey[300],
                fontSize: 13,
                mt: 0.25,
              }}
            >
              วางแผนงบประมาณของคุณสำหรับเดือนนี้
            </Typography>
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
            mb: 2.5,
            p: 2,
            borderRadius: "14px",
            backgroundColor: colors.primary[500],
            border: `1px solid ${colors.primary[600] || colors.primary[500]}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: colors.grey[200],
              lineHeight: 1.7,
            }}
          >
            เดือนนี้ <strong>({month})</strong> คุณอยากจำกัดงบใช้จ่ายไว้ที่เท่าไหร่?
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}

        <TextField
          label="Goal (บาท)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          autoFocus
          type="number"
          placeholder="เช่น 15000"
          InputProps={{
            startAdornment: (
              <SavingsOutlinedIcon
                sx={{
                  mr: 1,
                  color: colors.grey[400],
                  fontSize: 20,
                }}
              />
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: colors.primary[400],
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          backgroundColor: colors.primary[400],
          borderTop: `1px solid ${colors.primary[500]}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            color: colors.grey[300],
            borderRadius: "10px",
            px: 2,
          }}
        >
          Later
        </Button>

        <Button
          onClick={save}
          variant="contained"
          disabled={saving}
          sx={{
            minWidth: 120,
            textTransform: "none",
            fontWeight: 800,
            borderRadius: "10px",
            backgroundColor: colors.greenAccent[600],
            boxShadow: "none",
            "&:hover": {
              backgroundColor: colors.greenAccent[700],
              boxShadow: "none",
            },
          }}
        >
          {saving ? <CircularProgress size={18} color="inherit" /> : "Save Goal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}