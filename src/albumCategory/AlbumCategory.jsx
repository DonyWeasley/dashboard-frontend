import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Paper,
  Divider,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  useMediaQuery,
  Stack,
} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import Header from "../components/Header";
import { tokens } from "../theme";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const FALLBACK_CATEGORIES = [
  { key: "food-drink", label: "Food&Drink" },
  { key: "transport", label: "Transport" },
  { key: "shopping", label: "Shopping" },
  { key: "utilities", label: "Utilities" },
  { key: "others", label: "Others" },
];

function formatMoneyTHB(v) {
  const n = Number(v ?? 0);
  try {
    return n.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  } catch {
    return `${n.toFixed(2)} THB`;
  }
}

function formatDateEN(v) {
  if (!v) return "No recent item";
  return new Date(v).toLocaleString("th-TH-u-ca-gregory", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlbumCategoryPage() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);

  const token = useMemo(
    () =>
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token"),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE}/finance/categories/summary`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!cancelled) setSummary(data);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const categories = useMemo(() => {
    if (!Array.isArray(summary) || summary.length === 0) return FALLBACK_CATEGORIES;

    const map = new Map(summary.map((x) => [x.key, x]));
    return FALLBACK_CATEGORIES.map((c) => ({
      ...c,
      tx_count: map.get(c.key)?.tx_count ?? 0,
      total_amount: map.get(c.key)?.total_amount ?? 0,
      latest_at: map.get(c.key)?.latest_at ?? null,
      cover_path: map.get(c.key)?.cover_path ?? null,
    }));
  }, [summary]);

  return (
    <Box sx={{ m: { xs: 1.5, sm: 2, md: "20px" } }}>
      <Header title="ALBUM CATEGORY" subtitle="Finance folders" />

      <Box display="flex" justifyContent="center" alignItems="flex-start">
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "1150px",
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
              mb: 3,
              p: { xs: 2, md: 2.5 },
              borderRadius: "16px",
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`,
              border: `1px solid ${colors.primary[500]}`,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
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
                  <PhotoLibraryOutlinedIcon />
                  Finance Album Folders
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 0.75,
                    color: colors.grey[300],
                    maxWidth: 620,
                    lineHeight: 1.7,
                  }}
                >
                  เปิดดูรายการสลิปและธุรกรรมตามหมวดหมู่การใช้จ่ายของคุณได้จากที่นี่
                </Typography>
              </Box>

              <Chip
                label={`${categories.length} categories`}
                sx={{
                  fontWeight: 700,
                  backgroundColor: colors.greenAccent[600],
                  color: "#111",
                }}
              />
            </Stack>
          </Box>

          <Divider sx={{ mb: 3, borderColor: colors.primary[500] }} />

          {loading && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              py={5}
              gap={1.5}
            >
              <CircularProgress size={22} />
              <Typography color={colors.grey[300]}>
                Loading categories...
              </Typography>
            </Box>
          )}

          {!loading && error && (
            <Box mb={2}>
              <Alert severity="error" sx={{ borderRadius: "12px" }}>
                {error}
              </Alert>
            </Box>
          )}

          {!loading && !error && (
            <Grid
  container
  spacing={{ xs: 1.5, md: 2 }}
  justifyContent="center"
>
              {categories.map((c) => {
                const coverUrl = c.cover_path ? `${API_BASE}${c.cover_path}` : null;

                return (
                  <Grid
                    key={c.key}
                    item
                    xs={12}
                    sm={6}
                    md={6}
                    lg={4}
                  >
                    <Button
                      onClick={() => navigate(`/finance/categories/${c.key}`)}
                      fullWidth
                      disableElevation
                      sx={{
                        p: 0,
                        borderRadius: "16px",
                        textTransform: "none",
                        display: "block",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          borderRadius: "16px",
                          p: { xs: 1.75, md: 2 },
                          backgroundColor: colors.primary[500],
                          border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                          transition: "0.25s ease",
                          textAlign: "left",
                          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                          "&:hover": isMdUp
                            ? {
                                backgroundColor: colors.primary[600],
                                transform: "translateY(-3px)",
                                boxShadow: "0 14px 28px rgba(0,0,0,0.18)",
                              }
                            : undefined,
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="flex-start"
                          gap={2}
                        >
                          <Box
                            sx={{
                              width: { xs: 52, md: 58 },
                              height: { xs: 52, md: 58 },
                              borderRadius: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: colors.primary[400],
                              border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                              color: colors.greenAccent[400],
                              flexShrink: 0,
                            }}
                          >
                            <FolderOpenOutlinedIcon />
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              gap={1}
                            >
                              <Typography
                                variant={isSmDown ? "body1" : "h6"}
                                fontWeight={800}
                                color={colors.grey[100]}
                                noWrap
                              >
                                {c.label}
                              </Typography>

                              <Box
                                sx={{
                                  color: colors.grey[400],
                                  display: "flex",
                                  alignItems: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <ChevronRightRoundedIcon />
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                color: colors.grey[400],
                                fontSize: 13,
                              }}
                            >
                              แตะเพื่อเปิดดูรายการในหมวดนี้
                            </Typography>

                            <Box
                              mt={1.5}
                              display="flex"
                              alignItems="center"
                              gap={1}
                              flexWrap="wrap"
                            >
                              <Chip
                                size="small"
                                icon={<ReceiptLongOutlinedIcon />}
                                label={`${c.tx_count ?? 0} items`}
                                sx={{
                                  backgroundColor: colors.primary[400],
                                  color: colors.grey[200],
                                  border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                                  "& .MuiChip-icon": {
                                    color: colors.grey[300],
                                  },
                                }}
                              />

                              <Chip
                                size="small"
                                icon={<PaymentsOutlinedIcon />}
                                label={formatMoneyTHB(c.total_amount)}
                                sx={{
                                  backgroundColor: colors.primary[400],
                                  color: colors.greenAccent[200],
                                  border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                                  "& .MuiChip-icon": {
                                    color: colors.greenAccent[300],
                                  },
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>

                        <Box
                          mt={2}
                          pt={1.75}
                          sx={{
                            borderTop: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {coverUrl ? (
                            <Box
                              component="img"
                              src={coverUrl}
                              alt={`${c.label} cover`}
                              sx={{
                                width: 64,
                                height: 46,
                                borderRadius: "10px",
                                objectFit: "cover",
                                border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                                flexShrink: 0,
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 64,
                                height: 46,
                                borderRadius: "10px",
                                border: `1px dashed ${colors.primary[600] || colors.grey[700]}`,
                                backgroundColor: colors.primary[400],
                                opacity: 0.9,
                                flexShrink: 0,
                              }}
                            />
                          )}

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                color: colors.grey[400],
                                fontSize: 12,
                                mb: 0.25,
                              }}
                            >
                              Latest activity
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: colors.grey[300],
                                display: "block",
                                fontSize: 12.5,
                              }}
                              noWrap
                            >
                              {formatDateEN(c.latest_at)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Paper>
      </Box>
    </Box>
  );
}