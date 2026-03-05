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
  useMediaQuery,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { tokens } from "../theme";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

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

export default function CategoryDetailPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // ✅ desktop
  const title = labelMap[category] || category;

  const token = useMemo(
    () => localStorage.getItem("token") || sessionStorage.getItem("token"),
    []
  );

  const PAGE_SIZE = 24;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState([]);

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

  if (!category) {
    return (
      <Box m="20px">
        <Header title="CATEGORY" subtitle="Missing category param" />
        <Alert severity="error">URL ไม่ถูกต้อง: ไม่พบ category ใน path</Alert>
      </Box>
    );
  }

  return (
    <Box m={{ xs: "12px", sm: "16px", md: "20px" }}>
      <Header title="CATEGORY" subtitle={`Folder: ${title}`} />

      <Paper
        elevation={6}
        sx={{
          p: { xs: "16px", sm: "20px", md: "24px" },
          backgroundColor: colors.primary[400],
          borderRadius: "16px",
        }}
      >
        {/* Top bar */}
        <Box
          display="flex"
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant={isMdUp ? "h5" : "h6"} fontWeight={700} color={colors.grey[100]}>
              {title}
            </Typography>

            <Box mt="10px" display="flex" gap={1} flexWrap="wrap">
              <Chip
                size="small"
                label={`${total || 0} items`}
                sx={{
                  backgroundColor: colors.primary[500],
                  color: colors.grey[200],
                  border: `1px solid ${colors.grey[700]}`,
                }}
              />
              <Chip
                size="small"
                label={`Loaded: ${rows.length}`}
                sx={{
                  backgroundColor: colors.primary[500],
                  color: colors.grey[200],
                  border: `1px solid ${colors.grey[700]}`,
                }}
              />
              <Chip
                size="small"
                label={`Sum (loaded): ${formatMoneyTHB(totalAmountLoaded)}`}
                sx={{
                  backgroundColor: colors.primary[500],
                  color: colors.greenAccent[200],
                  border: `1px solid ${colors.grey[700]}`,
                }}
              />
            </Box>
          </Box>

          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              onClick={reload}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon />}
              variant="outlined"
              disabled={loading}
              sx={{
                color: colors.greenAccent[300],
                borderColor: colors.greenAccent[300],
                "&:hover": {
                  borderColor: colors.greenAccent[400],
                  backgroundColor: colors.primary[700],
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
                color: colors.greenAccent[300],
                borderColor: colors.greenAccent[300],
                "&:hover": {
                  borderColor: colors.greenAccent[400],
                  backgroundColor: colors.primary[700],
                },
              }}
            >
              Back
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: colors.grey[700] }} />

        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center" py={3} gap={1.5}>
            <CircularProgress size={18} />
            <Typography color={colors.grey[300]}>Loading...</Typography>
          </Box>
        )}

        {!loading && !error && rows.length === 0 && (
          <Alert severity="info">ไม่มีรายการในหมวดนี้</Alert>
        )}

        {/* ✅ Desktop = แนวนอนยาวไปขวา / Mobile = แนวตั้งลงมา */}
        {!loading && rows.length > 0 && (
          <Box
            sx={
              isMdUp
                ? {
                    display: "flex",
                    gap: 2,
                    overflowX: "auto",
                    pb: 1,
                    scrollSnapType: "x mandatory",
                    WebkitOverflowScrolling: "touch",
                    "&::-webkit-scrollbar": { height: 8 },
                  }
                : {
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }
            }
          >
            {rows.map((r) => {
              const imgUrl = r.file_path ? `${API_BASE}${r.file_path}` : null;

              return (
                <Box
                  key={r.id}
                  sx={{
                    // ✅ Desktop: card กว้างคงที่ เพื่อเลื่อนไปทางขวา
                    ...(isMdUp
                      ? { minWidth: 320, maxWidth: 360, flex: "0 0 auto", scrollSnapAlign: "start" }
                      : { width: "100%" }),
                    borderRadius: "14px",
                    border: `1px solid ${colors.grey[700]}`,
                    backgroundColor: colors.primary[500],
                    overflow: "hidden",
                    transition: "0.25s",
                    "&:hover": isMdUp
                      ? { backgroundColor: colors.primary[600], transform: "translateY(-2px)" }
                      : undefined,
                  }}
                >
                  <Box sx={{ width: "100%", aspectRatio: isMdUp ? "4 / 3" : "16 / 9", backgroundColor: colors.primary[400] }}>
                    {imgUrl ? (
                      <Box
                        component="img"
                        src={imgUrl}
                        alt="slip"
                        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
                        }}
                      >
                        No Image
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ p: "14px" }}>
                    <Typography color={colors.grey[100]} fontWeight={700} noWrap>
                      {formatMoneyTHB(r.amount)}
                    </Typography>

                    <Typography color={colors.grey[400]} variant="body2" mt="4px" noWrap>
                      {r.memo || "—"}
                    </Typography>

                    <Typography color={colors.grey[400]} variant="caption" display="block" mt="8px" noWrap>
                      {r.bank ? `Bank: ${r.bank}` : "Bank: —"}
                    </Typography>

                    <Typography color={colors.grey[400]} variant="caption" display="block" mt="2px" noWrap>
                      {r.transferred_at ? new Date(r.transferred_at).toLocaleString("th-TH") : "—"}
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
              startIcon={loadingMore ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                backgroundColor: colors.greenAccent[600],
                "&:hover": { backgroundColor: colors.greenAccent[700] },
                textTransform: "none",
              }}
            >
              {canLoadMore ? (loadingMore ? "Loading..." : "Load more") : "No more"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}