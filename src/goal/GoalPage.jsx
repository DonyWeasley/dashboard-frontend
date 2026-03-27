import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  useTheme,
  TextField,
  Button,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
} from "@mui/material";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";

import Header from "../components/Header";
import { tokens } from "../theme";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

function monthKeyNow() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("th-TH");
}
function formatMonthDisplay(monthStr) {
  if (!monthStr) return "-";
  const [year, month] = String(monthStr).split("-");
  if (!year || !month) return monthStr;
  return `${month}/${year}`;
}

export default function GoalPage() {
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

  const [month, setMonth] = useState(monthKeyNow());
  const [amount, setAmount] = useState("");
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/goals/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "Load goals failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
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

      setAmount("");
      await fetchAll();
    } catch (e) {
      setError(e?.message || "Save goal failed");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditAmount(String(row?.amount ?? ""));
    setEditOpen(true);
  };

  const submitEdit = async () => {
    if (!editRow?.id) return;

    const n = Number(editAmount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("กรุณากรอก goal เป็นตัวเลขมากกว่า 0");
      return;
    }

    setEditSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/goals/${editRow.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ amount: n }),
      });
      if (!res.ok) throw new Error(await res.text());

      setEditOpen(false);
      setEditRow(null);
      setEditAmount("");
      await fetchAll();
    } catch (e) {
      setError(e?.message || "Update goal failed");
    } finally {
      setEditSaving(false);
    }
  };

  const openDelete = (row) => {
    setDeleteRow(row);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteRow?.id) return;

    setDeleteSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/goals/${deleteRow.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(await res.text());

      setDeleteOpen(false);
      setDeleteRow(null);
      await fetchAll();
    } catch (e) {
      setError(e?.message || "Delete goal failed");
    } finally {
      setDeleteSaving(false);
    }
  };

  return (
    <Box sx={{ m: { xs: 1.5, sm: 2, md: "20px" } }}>
      <Header title="GOAL" subtitle="Set monthly spending goal" />

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: { xs: 2, sm: 2.5, md: 3 },
          backgroundColor: colors.primary[400],
          borderRadius: "18px",
          maxWidth: 1150,
          mx: "auto",
          border: `1px solid ${colors.primary[500]}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`,
            borderRadius: "16px",
            p: { xs: 2, md: 2.5 },
            border: `1px solid ${colors.primary[600]}`,
            mb: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            mb={2}
          >
            <Box>
              <Typography
                variant="h5"
                color={colors.grey[100]}
                fontWeight={800}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TrackChangesOutlinedIcon />
                ตั้ง goal รายเดือน
              </Typography>
              <Typography
                variant="body2"
                color={colors.grey[300]}
                sx={{ mt: 0.5 }}
              >
                กำหนดยอดใช้จ่ายเป้าหมายในแต่ละเดือนเพื่อควบคุมการใช้เงินของคุณ
              </Typography>
            </Box>

            <Chip
              label={`ทั้งหมด ${rows.length} รายการ`}
              sx={{
                fontWeight: 700,
                backgroundColor: colors.greenAccent[600],
                color: "#111",
              }}
            />
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
           <TextField
  label="เดือน"
  type="month"
  value={month}
  onChange={(e) => setMonth(e.target.value)}
  size="small"
  InputLabelProps={{ shrink: true }}
  InputProps={{
    startAdornment: (
      <CalendarMonthOutlinedIcon
        sx={{ mr: 1, color: colors.grey[400], fontSize: 20 }}
      />
    ),
  }}
  sx={{
    minWidth: { xs: "100%", md: 200 },
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: colors.primary[400],
    },
  }}
/>

            <TextField
              label="Goal (บาท)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              size="small"
              type="number"
              placeholder="เช่น 15000"
              InputProps={{
                startAdornment: (
                  <SavingsOutlinedIcon
                    sx={{ mr: 1, color: colors.grey[400], fontSize: 20 }}
                  />
                ),
              }}
              sx={{
                minWidth: { xs: "100%", md: 240 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: colors.primary[400],
                },
              }}
            />

            <Button
              onClick={onSave}
              disabled={saving}
              variant="contained"
              sx={{
                height: 40,
                minWidth: { xs: "100%", md: 160 },
                borderRadius: "12px",
                fontWeight: 800,
                textTransform: "none",
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
          </Stack>
        </Box>

        <Divider sx={{ my: 3, borderColor: colors.primary[500] }} />

        <Box mb={1.5}>
          <Typography
            color={colors.grey[100]}
            fontWeight={800}
            fontSize={{ xs: 16, md: 18 }}
          >
            ประวัติการตั้ง goal
          </Typography>
          <Typography color={colors.grey[400]} fontSize={13}>
            รายการเป้าหมายรายเดือนทั้งหมดของคุณ
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <TableContainer
            sx={{
              borderRadius: "14px",
              border: `1px solid ${colors.primary[500]}`,
              overflow: "hidden",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: colors.primary[500],
                  }}
                >
                  <TableCell sx={{ fontWeight: 800, color: colors.grey[100] }}>
                    เดือน
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, color: colors.grey[100] }}
                  >
                    Goal (บาท)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: colors.grey[100] }}>
                    ตั้งเมื่อ
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, color: colors.grey[100] }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow
                    key={r.id}
                    hover
                    sx={{
                      backgroundColor:
                        idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.05)",
                      },
                      transition: "0.2s ease",
                    }}
                  >
                  <TableCell sx={{ color: colors.grey[100], fontWeight: 700 }}>
  {formatMonthDisplay(r.month)}
</TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        color: colors.greenAccent[400],
                        fontWeight: 800,
                      }}
                    >
                      {formatMoney(r.amount)}
                    </TableCell>

                   <TableCell sx={{ color: colors.grey[300] }}>
  {r.created_at
    ? new Date(r.created_at).toLocaleString("th-TH-u-ca-gregory")
    : "-"}
</TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={() => openEdit(r)}
                        size="small"
                        aria-label="edit"
                        sx={{
                          mr: 0.5,
                          color: colors.greenAccent[300],
                          backgroundColor: "rgba(0,0,0,0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.08)",
                          },
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        onClick={() => openDelete(r)}
                        size="small"
                        aria-label="delete"
                        sx={{
                          color: colors.redAccent[300],
                          backgroundColor: "rgba(0,0,0,0.08)",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.08)",
                          },
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ py: 5 }}>
                      <Box textAlign="center">
                        <Typography
                          color={colors.grey[300]}
                          fontWeight={700}
                          mb={0.5}
                        >
                          ยังไม่มีข้อมูล goal
                        </Typography>
                        <Typography color={colors.grey[500]} fontSize={13}>
                          เริ่มเพิ่มเป้าหมายรายเดือนของคุณได้เลย
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: colors.primary[400],
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: colors.grey[100] }}>
          แก้ไข Goal
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.primary[500] }}>
          <Typography variant="body2" sx={{ mb: 2, color: colors.grey[300] }}>
            เดือน: <strong>{editRow?.month || "-"}</strong>
          </Typography>

          <TextField
            label="Goal (บาท)"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            fullWidth
            autoFocus
            type="number"
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} disabled={editSaving}>
            Cancel
          </Button>
          <Button
            onClick={submitEdit}
            variant="contained"
            disabled={editSaving}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: colors.greenAccent[600],
              "&:hover": { backgroundColor: colors.greenAccent[700] },
            }}
          >
            {editSaving ? <CircularProgress size={18} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

     <Dialog
  open={deleteOpen}
  onClose={deleteSaving ? undefined : () => setDeleteOpen(false)}
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
        <DeleteOutlineOutlinedIcon fontSize="small" />
      </Box>

      <Box>
        <Typography
          sx={{
            color: colors.grey[100],
            fontWeight: 800,
            fontSize: 19,
            lineHeight: 1.2,
          }}
        >
          ลบ Goal?
        </Typography>
        <Typography
          sx={{
            color: colors.grey[300],
            fontSize: 13,
            mt: 0.25,
          }}
        >
          การกระทำนี้ไม่สามารถย้อนกลับได้
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
          lineHeight: 1.75,
        }}
      >
        คุณต้องการลบ goal ของเดือน{" "}
        <Box
          component="span"
          sx={{
            color: colors.redAccent[300],
            fontWeight: 800,
          }}
        >
          {deleteRow?.month || "-"}
        </Box>{" "}
        ใช่ไหม?
      </Typography>

      <Typography
        sx={{
          mt: 1,
          fontSize: 13,
          color: colors.grey[400],
        }}
      >
        เมื่อลบแล้ว ข้อมูล goal เดือนนี้จะหายไปจากรายการ
      </Typography>
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
      onClick={() => setDeleteOpen(false)}
      disabled={deleteSaving}
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
      onClick={confirmDelete}
      variant="contained"
      disabled={deleteSaving}
      startIcon={
        !deleteSaving ? <DeleteOutlineOutlinedIcon fontSize="small" /> : null
      }
      sx={{
        minWidth: 130,
        borderRadius: "10px",
        textTransform: "none",
        fontWeight: 800,
        backgroundColor: colors.redAccent[500],
        boxShadow: "none",
        "&:hover": {
          backgroundColor: colors.redAccent[600],
          boxShadow: "none",
        },
      }}
    >
      {deleteSaving ? <CircularProgress size={18} color="inherit" /> : "Delete"}
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}