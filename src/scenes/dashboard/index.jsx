import {
  Box,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const fmtMoney = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const pctText = (pct) => {
  const p = Number(pct || 0);
  if (p > 0) return `▲ +${Math.abs(p).toFixed(1)}%`;
  if (p < 0) return `▼ -${Math.abs(p).toFixed(1)}%`;
  return `• +0.0%`;
};

const pctColor = (colors, pct) => {
  const p = Number(pct || 0);
  if (p > 0) return colors.redAccent[300];
  if (p < 0) return colors.greenAccent[400];
  return colors.grey[300];
};

const getCategoryColor = (colors, cat) => {
  switch (cat) {
    case "Food&Drink":
      return colors.greenAccent[500];
    case "Transport":
      return colors.blueAccent[400];
    case "Shopping":
      return colors.purpleAccent?.[400] || colors.blueAccent[300];
    case "Utilities":
      return colors.redAccent[300];
    default:
      return colors.grey[400];
  }
};

const CATEGORY_ORDER = [
  "Food&Drink",
  "Transport",
  "Shopping",
  "Utilities",
  "Others",
];

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token") ||
  "";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ✅ Lock view to TODAY only
  const range = "today";

  const [cards, setCards] = useState(null);
  const [chartItems, setChartItems] = useState([]);
  const [recent, setRecent] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setErr("");

      const token = getToken();

      try {
        const res = await fetch(`${API_BASE}/dashboard/?view=${range}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const text = await res.text();
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

        const data = text ? JSON.parse(text) : {};

        setCards(data?.cards || null);

        const items = data?.expense_by_category?.items || [];
        setChartItems(Array.isArray(items) ? items : []);

        setRecent(
          Array.isArray(data?.recent_transactions)
            ? data.recent_transactions
            : [],
        );
      } catch (e) {
        setErr(e?.message || "Failed to load dashboard");
        setCards(null);
        setChartItems([]);
        setRecent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const chartData = useMemo(() => {
    const map = new Map();

    (chartItems || []).forEach((x) => {
      const cat = x?.category || "Others";
      const total = Number(x?.total ?? 0);
      map.set(cat, (map.get(cat) || 0) + total);
    });

    return CATEGORY_ORDER.map((cat) => ({
      category: cat,
      total: map.get(cat) ?? 0,
    }));
  }, [chartItems]);

  // ✅ interpret all cards as TODAY values
  const avgDay = cards?.average_per_day || { value: 0, pct: 0 };
  const todayTx = cards?.total_transactions || { value: 0, pct: 0 };
  const topCatToday = cards?.top_spending_category || {
    category: "Others",
    value: 0,
    pct: 0,
  };

  // ✅ small card style
  const cardBoxSx = {
    backgroundColor: colors.primary[400],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    px: { xs: 2, md: 1.5 },
    py: { xs: 2, md: 1.2 },
  };

  const cardTitleSx = {
    color: colors.grey[200],
    fontWeight: 700,
    mb: 0.5,
    fontSize: { xs: 14, md: 14 },
  };

  const cardValueSx = {
    fontWeight: 900,
    lineHeight: 1,
    fontSize: { xs: 40, md: 44 },
  };

  const cardSubSx = {
    color: colors.grey[300],
    mt: 0.5,
    fontSize: { xs: 13, md: 13 },
  };

  const cardPctSx = {
    mt: 0.75,
    fontWeight: 700,
    fontSize: { xs: 12, md: 12 },
  };

  return (
    <Box sx={{ m: { xs: 2, md: "20px" } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        flexDirection={{ xs: "column", md: "row" }}
        gap={{ xs: 1, md: 0 }}
      >
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      <Box
        display="grid"
        gridTemplateColumns={isMobile ? "1fr" : "repeat(12, 1fr)"}
        gridAutoRows={isMobile ? "auto" : "120px"}
        gap={{ xs: 2, md: "20px" }}
        sx={{ position: "relative", "& > *": { minWidth: 0 } }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              backdropFilter: "blur(2px)",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* TOP ROW: 3 cards */}
        <Box gridColumn={isMobile ? "1 / -1" : "span 4"} sx={cardBoxSx}>
          <Box textAlign="center">
            <Typography sx={cardTitleSx}>Total Today</Typography>
            <Typography sx={{ ...cardValueSx, color: colors.greenAccent[500] }}>
              {fmtMoney(avgDay.value)} ฿
            </Typography>
            <Typography sx={cardSubSx}>Today's Spending</Typography>
            <Typography
              sx={{ ...cardPctSx, color: pctColor(colors, avgDay.pct) }}
            >
              {pctText(avgDay.pct)} from yesterday
            </Typography>
          </Box>
        </Box>

        <Box gridColumn={isMobile ? "1 / -1" : "span 4"} sx={cardBoxSx}>
          <Box textAlign="center">
            <Typography sx={cardTitleSx}>Total Transactions Today</Typography>
            <Typography sx={{ ...cardValueSx, color: colors.greenAccent[400] }}>
              {todayTx.value ?? 0}
            </Typography>
            <Typography sx={cardSubSx}>Transactions Today</Typography>
            <Typography
              sx={{ ...cardPctSx, color: pctColor(colors, todayTx.pct) }}
            >
              {pctText(todayTx.pct)} from yesterday
            </Typography>
          </Box>
        </Box>

        <Box gridColumn={isMobile ? "1 / -1" : "span 4"} sx={cardBoxSx}>
          <Box textAlign="center">
            <Typography sx={cardTitleSx}>
              Top Spending Category Today
            </Typography>
            <Typography
              sx={{
                fontWeight: 900,
                lineHeight: 1.05,
                fontSize: { xs: 28, md: 32 },
                color: colors.greenAccent[400],
                wordBreak: "break-word",
              }}
            >
              {topCatToday.category || "Others"}
            </Typography>
            <Typography sx={cardSubSx}>Most Spending Category Today</Typography>
            <Typography
              sx={{ ...cardPctSx, color: pctColor(colors, topCatToday.pct) }}
            >
              {pctText(topCatToday.pct)} from yesterday
            </Typography>
          </Box>
        </Box>

        {/* ✅ LEFT: CHART (span 3 rows => สูงเท่า Recent) */}
        <Box
          gridColumn={isMobile ? "1 / -1" : "span 8"}
          gridRow={isMobile ? "auto" : "span 3"} // ✅ จาก span 2 -> span 3
          backgroundColor={colors.primary[400]}
          p={{ xs: 2, md: "18px" }}
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column", // ✅ เพื่อให้กราฟยืดเต็มความสูง
            overflow: "hidden",
          }}
        >
          <Box mb="10px" sx={{ minWidth: 0, flexShrink: 0 }}>
            <Typography variant="h5" fontWeight="700" color={colors.grey[100]}>
              Expense by Category
            </Typography>
            <Typography variant="h6" color={colors.greenAccent[500]}>
              Spending Overview (Today)
            </Typography>
          </Box>

          {/* ✅ กราฟยืดเต็มพื้นที่ที่เหลือ (สูงเท่ากล่อง Recent) */}
          <Box sx={{ flex: 1, minHeight: 260, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ left: 4, right: 4, top: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={isMobile ? -25 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 30}
                />
                <YAxis width={isMobile ? 36 : 48} />
                <Tooltip
                  formatter={(value) => [`${fmtMoney(value)} ฿`, "Total"]}
                  contentStyle={{
                    backgroundColor: colors.primary[500],
                    border: `1px solid rgba(255,255,255,0.18)`,
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 800 }}
                  itemStyle={{ color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.category}`}
                      fill={getCategoryColor(colors, entry.category)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* RIGHT: RECENT (span 3 rows) */}
        <Box
          gridColumn={isMobile ? "1 / -1" : "span 4"}
          gridRow={isMobile ? "auto" : "span 3"}
          backgroundColor={colors.primary[400]}
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",

            // ✅ เพิ่มตรงนี้ (สำคัญมาก)
            ...(isMobile ? { maxHeight: "70vh" } : {}),
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
            sx={{ flexShrink: 0 }}
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="700">
              Recent Transactions
            </Typography>
          </Box>

          <Box sx={{ overflow: "auto", flex: 1 }}>
            {recent.map((tx, i) => (
              <Box
                key={`${tx.id}-${i}`}
                display="flex"
                flexDirection={isMobile ? "column" : "row"}
                gap={isMobile ? 1 : 0}
                alignItems="flex-start"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
                sx={{ minWidth: 0 }}
              >
                <Box sx={{ width: isMobile ? "100%" : "50%", minWidth: 0 }}>
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="700"
                    sx={{ wordBreak: "break-word" }}
                  >
                    {tx.category || "Others"}
                  </Typography>
                  <Typography color={colors.grey[100]} sx={{ opacity: 0.95 }}>
                    {tx.bank || "-"}
                  </Typography>

                  {tx.file_url && (
                    <a
                      href={tx.file_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: colors.greenAccent[300], fontSize: 12 }}
                    >
                      View Slip
                    </a>
                  )}
                </Box>

                <Box
                  sx={{
                    width: isMobile ? "100%" : "25%",
                    textAlign: isMobile ? "left" : "center",
                  }}
                  color={colors.grey[100]}
                >
                  {tx.date || "-"}
                </Box>

                <Box
                  sx={{
                    width: isMobile ? "100%" : "25%",
                    display: "flex",
                    justifyContent: isMobile ? "flex-start" : "flex-end",
                  }}
                >
                  <Box
                    sx={{
                      width: isMobile ? "fit-content" : "90px",
                      textAlign: "center",
                      backgroundColor: colors.greenAccent[500],
                      p: "5px 10px",
                      borderRadius: "4px",
                      fontWeight: 700,
                    }}
                  >
                    {fmtMoney(tx.amount)}฿
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
