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
} from "@mui/material";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

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
    return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
  } catch {
    return `${n.toFixed(2)} THB`;
  }
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
    () => localStorage.getItem("token") || sessionStorage.getItem("token"),
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
    <Box m={{ xs: "12px", sm: "16px", md: "20px" }}>
      <Header title="ALBUM CATEGORY" subtitle="Finance folders" />

      <Box display="flex" justifyContent="center" alignItems="flex-start">
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: "1100px",
            p: { xs: "16px", sm: "20px", md: "32px" },
            backgroundColor: colors.primary[400],
            borderRadius: "16px",
          }}
        >
          <Box textAlign="center" mb={{ xs: 2, md: 3 }}>
            <Typography
              variant={isSmDown ? "h5" : "h4"}
              fontWeight="700"
              color={colors.grey[100]}
            >
              Finance Album Folders
            </Typography>
            <Typography variant="body2" color={colors.grey[300]} mt="8px">
              Tap a folder to open items inside
            </Typography>
          </Box>

          <Divider sx={{ mb: "18px", borderColor: colors.grey[700] }} />

          {loading && (
            <Box display="flex" alignItems="center" justifyContent="center" py={2} gap={1.5}>
              <CircularProgress size={18} />
              <Typography color={colors.grey[300]}>Loading categories...</Typography>
            </Box>
          )}

          {!loading && error && (
            <Box mb={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {categories.map((c) => {
              const coverUrl = c.cover_path ? `${API_BASE}${c.cover_path}` : null;

              return (
                <Grid
                  key={c.key}
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={4} // ✅ จอกว้างมากจะเป็น 3 คอลัมน์
                >
                  <Button
                    onClick={() => navigate(`/finance/categories/${c.key}`)}
                    fullWidth
                    disableElevation
                    sx={{ textTransform: "none", p: 0, borderRadius: "14px" }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        borderRadius: "14px",
                        p: { xs: "14px", md: "18px" },
                        backgroundColor: colors.primary[500],
                        border: `1px solid ${colors.grey[700]}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        transition: "0.25s",
                        "&:hover": isMdUp
                          ? { backgroundColor: colors.primary[600], transform: "translateY(-2px)" }
                          : undefined,
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 48, md: 54 },
                          height: { xs: 48, md: 54 },
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.primary[400],
                          border: `1px solid ${colors.grey[700]}`,
                          color: colors.greenAccent[400],
                          flexShrink: 0,
                        }}
                      >
                        <FolderOpenOutlinedIcon />
                      </Box>

                      <Box sx={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color={colors.grey[100]}
                          noWrap
                        >
                          {c.label}
                        </Typography>

                        <Box mt="6px" display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Chip
                            size="small"
                            label={`${c.tx_count ?? 0} items`}
                            sx={{
                              backgroundColor: colors.primary[400],
                              color: colors.grey[200],
                              border: `1px solid ${colors.grey[700]}`,
                            }}
                          />
                          <Chip
                            size="small"
                            label={formatMoneyTHB(c.total_amount)}
                            sx={{
                              backgroundColor: colors.primary[400],
                              color: colors.greenAccent[200],
                              border: `1px solid ${colors.grey[700]}`,
                            }}
                          />
                        </Box>

                        <Box mt="10px" display="flex" alignItems="center" gap={1.5}>
                          {coverUrl ? (
                            <Box
                              component="img"
                              src={coverUrl}
                              alt={`${c.label} cover`}
                              sx={{
                                width: 54,
                                height: 40,
                                borderRadius: "10px",
                                objectFit: "cover",
                                border: `1px solid ${colors.grey[700]}`,
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 54,
                                height: 40,
                                borderRadius: "10px",
                                border: `1px dashed ${colors.grey[700]}`,
                                backgroundColor: colors.primary[400],
                                opacity: 0.9,
                              }}
                            />
                          )}

                          <Typography variant="caption" color={colors.grey[400]} noWrap>
                            {c.latest_at
                              ? `Latest: ${new Date(c.latest_at).toLocaleString("th-TH")}`
                              : "No recent item"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ color: colors.grey[400], display: "flex", alignItems: "center" }}>
                        <ChevronRightRoundedIcon />
                      </Box>
                    </Box>
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}