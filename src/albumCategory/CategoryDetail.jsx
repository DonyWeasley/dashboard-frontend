import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { tokens } from "../theme";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const labelMap = {
  "food-drink": "Food&Drink",
  transport: "Transport",
  shopping: "Shopping",
  utilities: "Utilities",
  others: "Others",
};

function formatMoneyTHB(v) {
  const n = Number(v ?? 0);
  try {
    return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
  } catch {
    return `${n.toFixed(2)} THB`;
  }
}

function formatDateEN(v) {
  if (!v) return "—";
  return new Date(v).toLocaleString("th-TH-u-ca-gregory", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CategoryDetailPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const title = labelMap[category] || category;

  const token = useMemo(
    () =>
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token"),
    []
  );

  const PAGE_SIZE = 24;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);

  const [selectedSlip, setSelectedSlip] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const canLoadMore = rows.length < total;

  const fetchPage = async (nextPage, { append } = { append: false }) => {
    const url = `${API_BASE}/finance/categories/${category}/transactions?page=${nextPage}&page_size=${PAGE_SIZE}`;

    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const incoming = Array.isArray(data?.rows) ? data.rows : [];

    setTotal(Number(data?.total ?? 0));
    setPage(Number(data?.page ?? nextPage));
    setRows((prev) => (append ? [...prev, ...incoming] : incoming));
  };

  const reload = async () => {
    if (!category) return;
    setLoading(true);
    setError("");
    try {
      await fetchPage(1, { append: false });
    } catch (e) {
      setError(e?.message || "Failed to load category items");
      setRows([]);
      setTotal(0);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!category) return;
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const handleLoadMore = async () => {
    if (loadingMore || loading || !canLoadMore) return;
    setLoadingMore(true);
    setError("");
    try {
      await fetchPage(page + 1, { append: true });
    } catch (e) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const totalAmountLoaded = useMemo(() => {
    return rows.reduce((sum, r) => sum + Number(r?.amount ?? 0), 0);
  }, [rows]);

  const handleOpenPopup = (row) => {
    setSelectedSlip(row);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedSlip(null);
  };

  if (!category) {
    return (
      <Box sx={{ m: { xs: 1.5, sm: 2, md: "20px" } }}>
        <Header title="CATEGORY" subtitle="Missing category param" />
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          URL ไม่ถูกต้อง: ไม่พบ category ใน path
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ m: { xs: 1.5, sm: 2, md: "20px" } }}>
      <Header title="CATEGORY" subtitle={`Folder: ${title}`} />

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: { xs: 2, sm: 2.5, md: 3 },
          backgroundColor: colors.primary[400],
          borderRadius: "18px",
          border: `1px solid ${colors.primary[500]}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`,
            border: `1px solid ${colors.primary[500]}`,
            mb: 3,
          }}
        >
          <Box
            display="flex"
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
          >
            <Box>
              <Typography
                sx={{
                  color: colors.grey[100],
                  fontWeight: 800,
                  fontSize: { xs: 22, md: 26 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <FolderOpenOutlinedIcon />
                {title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  color: colors.grey[300],
                  lineHeight: 1.7,
                }}
              >
                ดูรายการธุรกรรมและสลิปทั้งหมดในหมวดนี้
              </Typography>

              <Box mt={1.5} display="flex" gap={1} flexWrap="wrap">
                <Chip
                  size="small"
                  icon={<ReceiptLongOutlinedIcon />}
                  label={`${total || 0} items`}
                  sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.grey[200],
                    border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                    "& .MuiChip-icon": { color: colors.grey[300] },
                  }}
                />
                <Chip
                  size="small"
                  label={`Loaded: ${rows.length}`}
                  sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.grey[200],
                    border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                  }}
                />
                <Chip
                  size="small"
                  icon={<PaymentsOutlinedIcon />}
                  label={`Sum: ${formatMoneyTHB(totalAmountLoaded)}`}
                  sx={{
                    backgroundColor: colors.primary[400],
                    color: colors.greenAccent[200],
                    border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                    "& .MuiChip-icon": { color: colors.greenAccent[300] },
                  }}
                />
              </Box>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                onClick={reload}
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <RefreshRoundedIcon />
                  )
                }
                variant="outlined"
                disabled={loading}
                sx={{
                  minWidth: 120,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  color: colors.greenAccent[300],
                  borderColor: colors.greenAccent[300],
                  "&:hover": {
                    borderColor: colors.greenAccent[400],
                    backgroundColor: colors.primary[600],
                  },
                }}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </Button>

              <Button
                onClick={() => navigate(-1)}
                startIcon={<ArrowBackRoundedIcon />}
                variant="outlined"
                sx={{
                  minWidth: 110,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  color: colors.greenAccent[300],
                  borderColor: colors.greenAccent[300],
                  "&:hover": {
                    borderColor: colors.greenAccent[400],
                    backgroundColor: colors.primary[600],
                  },
                }}
              >
                Back
              </Button>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 3, borderColor: colors.primary[500] }} />

        {error && (
          <Box mb={2}>
            <Alert severity="error" sx={{ borderRadius: "12px" }}>
              {error}
            </Alert>
          </Box>
        )}

        {loading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={5}
            gap={1.5}
          >
            <CircularProgress size={22} />
            <Typography color={colors.grey[300]}>Loading...</Typography>
          </Box>
        )}

        {!loading && !error && rows.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: "12px" }}>
            ไม่มีรายการในหมวดนี้
          </Alert>
        )}

        {!loading && rows.length > 0 && (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
        lg: "repeat(4, 1fr)",
      },
      gap: 2,
      alignItems: "stretch",
    }}
  >
    {rows.map((r) => {
      const imgUrl = r.file_path ? `${API_BASE}${r.file_path}` : null;

      return (
        <Box
          key={r.id}
          onClick={() => handleOpenPopup(r)}
          sx={{
            cursor: "pointer",
            borderRadius: "16px",
            border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
            backgroundColor: colors.primary[500],
            overflow: "hidden",
            transition: "0.25s ease",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            "&:hover": {
              backgroundColor: colors.primary[600],
              transform: "translateY(-3px)",
              boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 170,
              backgroundColor: colors.primary[400],
              borderBottom: `1px solid ${colors.primary[600] || colors.grey[700]}`,
            }}
          >
            {imgUrl ? (
              <Box
                component="img"
                src={imgUrl}
                alt="slip"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  color: colors.grey[400],
                  fontSize: 14,
                }}
              >
                No Image
              </Box>
            )}
          </Box>

          <Box sx={{ p: "14px" }}>
            <Typography
              color={colors.greenAccent[300]}
              fontWeight={800}
              fontSize={20}
              noWrap
            >
              {formatMoneyTHB(r.amount)}
            </Typography>

            <Typography
              color={colors.grey[100]}
              variant="body2"
              mt="6px"
              noWrap
              sx={{ fontWeight: 600 }}
            >
              {r.memo || "—"}
            </Typography>

            <Typography
              color={colors.grey[400]}
              variant="caption"
              display="block"
              mt="10px"
              noWrap
            >
              {r.bank ? `Bank: ${r.bank}` : "Bank: —"}
            </Typography>

            <Typography
              color={colors.grey[400]}
              variant="caption"
              display="block"
              mt="4px"
              noWrap
            >
              {formatDateEN(r.transferred_at)}
            </Typography>
          </Box>
        </Box>
      );
    })}
  </Box>
)}

        {!loading && rows.length > 0 && (
          <Box mt={3} display="flex" justifyContent="center">
            <Button
              onClick={handleLoadMore}
              disabled={!canLoadMore || loadingMore}
              variant="contained"
              startIcon={
                loadingMore ? <CircularProgress size={16} color="inherit" /> : null
              }
              sx={{
                minWidth: 140,
                borderRadius: "12px",
                backgroundColor: colors.greenAccent[600],
                "&:hover": { backgroundColor: colors.greenAccent[700] },
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "none",
              }}
            >
              {canLoadMore ? (loadingMore ? "Loading..." : "Load more") : "No more"}
            </Button>
          </Box>
        )}
      </Paper>

      <Dialog
        open={popupOpen}
        onClose={handleClosePopup}
        fullWidth
        maxWidth="md"
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
            color: colors.grey[100],
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography fontWeight={800} fontSize={20}>
              Slip Detail
            </Typography>
            <Typography fontSize={13} color={colors.grey[300]} mt={0.25}>
              รายละเอียดของรายการที่เลือก
            </Typography>
          </Box>

          <IconButton
            onClick={handleClosePopup}
            sx={{ color: colors.grey[100] }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            backgroundColor: colors.primary[400],
            p: 0,
          }}
        >
          {selectedSlip && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr" },
                gap: 0,
              }}
            >
              <Box
                sx={{
                  backgroundColor: colors.primary[500],
                  minHeight: { xs: 260, md: 520 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  borderRight: { md: `1px solid ${colors.primary[500]}` },
                }}
              >
                {selectedSlip.file_path ? (
                  <Box
                    component="img"
                    src={`${API_BASE}${selectedSlip.file_path}`}
                    alt="slip preview"
                    sx={{
                      width: "100%",
                      maxHeight: { xs: 320, md: 560 },
                      objectFit: "contain",
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <Typography color={colors.grey[400]}>No Image</Typography>
                )}
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color={colors.greenAccent[300]}
                  mb={2.5}
                >
                  {formatMoneyTHB(selectedSlip.amount)}
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: "14px",
                    backgroundColor: colors.primary[500],
                    border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                  }}
                >
                  <Box display="grid" gap={1.5}>
                    <Box>
                      <Typography variant="caption" color={colors.grey[400]}>
                        Memo
                      </Typography>
                      <Typography color={colors.grey[100]}>
                        {selectedSlip.memo || "—"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color={colors.grey[400]}>
                        Bank
                      </Typography>
                      <Typography color={colors.grey[100]}>
                        {selectedSlip.bank || "—"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color={colors.grey[400]}>
                        Date / Time
                      </Typography>
                      <Typography color={colors.grey[100]}>
                        {formatDateEN(selectedSlip.transferred_at)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color={colors.grey[400]}>
                        Category
                      </Typography>
                      <Typography color={colors.grey[100]}>
                        {selectedSlip.category || title || "—"}
                      </Typography>
                    </Box>

                    {selectedSlip.file_path && (
                      <Box>
                        <Typography variant="caption" color={colors.grey[400]}>
                          File Path
                        </Typography>
                        <Typography
                          color={colors.grey[100]}
                          sx={{ wordBreak: "break-all" }}
                        >
                          {selectedSlip.file_path}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                <Box
                  mt={2}
                  display="flex"
                  alignItems="center"
                  gap={1}
                  color={colors.grey[400]}
                >
                  <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                  <Typography variant="caption">
                    เปิดดูรูปสลิปแบบเต็มได้จากส่วนแสดงตัวอย่างด้านซ้าย
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            backgroundColor: colors.primary[400],
            px: 3,
            pb: 2.5,
            pt: 2,
            borderTop: `1px solid ${colors.primary[500]}`,
          }}
        >
          <Button
            onClick={handleClosePopup}
            variant="contained"
            sx={{
              minWidth: 110,
              borderRadius: "10px",
              fontWeight: 800,
              textTransform: "none",
              backgroundColor: colors.greenAccent[600],
              "&:hover": { backgroundColor: colors.greenAccent[700] },
              boxShadow: "none",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}