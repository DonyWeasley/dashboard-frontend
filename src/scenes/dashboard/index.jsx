import {
  Box,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
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

import GoalPopup from "../../goal/GoalPopup";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const fmtMoney = (n) => {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
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

  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  const range = "today";

  const [cards, setCards] = useState(null);
  const [chartItems, setChartItems] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [goalPopupOpen, setGoalPopupOpen] = useState(false);
  const [checkingGoal, setCheckingGoal] = useState(false);

  const checkGoalCurrentMonth = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    setCheckingGoal(true);

    try {


      // แนะนำให้ backend ตรวจจากเดือนปัจจุบันให้เลย
      // หรือถ้า endpoint ของคุณต้องใช้ query ก็เติม ?month=${month}
      const res = await fetch(`${API_BASE}/goals/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

      const data = text ? JSON.parse(text) : {};

      // คาดหวัง response เช่น:
      // { has_goal: true/false, goal: 20000, month: "2026-03" }

      if (data?.has_goal === false) {
        setGoalPopupOpen(true);
      } else {
        setGoalPopupOpen(false);
      }
    } catch (error) {
      console.error("Failed to check current goal:", error);
    } finally {
      setCheckingGoal(false);
    }
  }, []);

  useEffect(() => {
    checkGoalCurrentMonth();
  }, [checkGoalCurrentMonth]);

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
        setChartItems(
          Array.isArray(data?.expense_by_category?.items)
            ? data.expense_by_category.items
            : []
        );
        setRecent(
          Array.isArray(data?.recent_transactions)
            ? data.recent_transactions
            : []
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

  const avgDay = cards?.average_per_day || { value: 0, pct: 0 };
  const todayTx = cards?.total_transactions || { value: 0, pct: 0 };
  const topCatToday = cards?.top_spending_category || {
    category: "Others",
    value: 0,
    pct: 0,
  };

  const cardBoxSx = {
    backgroundColor: colors.primary[400],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    px: { xs: 2, sm: 2.5, md: 2 },
    py: { xs: 1.5, sm: 1.75, md: 2 },
    minHeight: { xs: 105, sm: 115, md: 130 },
  };

  const cardTitleSx = {
    color: colors.grey[200],
    fontWeight: 700,
    mb: 0.5,
    fontSize: { xs: 12, sm: 13, md: 14 },
  };

  const cardValueSx = {
    fontWeight: 900,
    lineHeight: 1,
    fontSize: { xs: 24, sm: 28, md: 36, lg: 42 },
  };

  const cardSubSx = {
    color: colors.grey[300],
    mt: 0.5,
    fontSize: { xs: 11, sm: 12, md: 13 },
  };



  return (
    <Box sx={{ m: { xs: 1, sm: 1.5, md: "20px" } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        flexDirection={{ xs: "column", md: "row" }}
        gap={{ xs: 0.5, md: 0 }}
        mb={{ xs: 1.5, md: 2 }}
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
        gridTemplateColumns={{
          xs: "1fr",
          md: "repeat(12, 1fr)",
        }}
        gridAutoRows={{ xs: "auto", md: "minmax(100px, auto)" }}
        gap={{ xs: 1.5, sm: 2, md: "20px" }}
        sx={{ position: "relative", "& > *": { minWidth: 0 } }}
      >
        {(loading || checkingGoal) && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 5,
              backdropFilter: "blur(2px)",
              backgroundColor: "rgba(0,0,0,0.08)",
              borderRadius: 2,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Box gridColumn={{ xs: "1 / -1", md: "span 4" }} sx={cardBoxSx}>
          <Box textAlign="center">
            <Typography sx={cardTitleSx}>Total Today</Typography>
            <Typography sx={{ ...cardValueSx, color: colors.greenAccent[500] }}>
              {fmtMoney(avgDay.value)} ฿
            </Typography>
            <Typography sx={cardSubSx}>Today's Spending</Typography>
          
          </Box>
        </Box>

        <Box gridColumn={{ xs: "1 / -1", md: "span 4" }} sx={cardBoxSx}>
          <Box textAlign="center">
            <Typography sx={cardTitleSx}>Total Transactions Today</Typography>
            <Typography sx={{ ...cardValueSx, color: colors.greenAccent[400] }}>
              {todayTx.value ?? 0}
            </Typography>
            <Typography sx={cardSubSx}>Transactions Today</Typography>
            
          </Box>
        </Box>

        <Box gridColumn={{ xs: "1 / -1", md: "span 4" }} sx={cardBoxSx}>
          <Box textAlign="center" sx={{ width: "100%" }}>
            <Typography sx={cardTitleSx}>Top Spending Category Today</Typography>
            <Typography
              sx={{
                fontWeight: 900,
                lineHeight: 1.05,
                fontSize: { xs: 20, sm: 24, md: 28, lg: 32 },
                color: colors.greenAccent[400],
                wordBreak: "break-word",
              }}
            >
              {topCatToday.category || "Others"}
            </Typography>
            <Typography sx={cardSubSx}>Most Spending Category Today</Typography>
           
          </Box>
        </Box>

        <Box
          gridColumn={{ xs: "1 / -1", md: "span 8" }}
          gridRow={{ xs: "auto", md: "span 3" }}
          backgroundColor={colors.primary[400]}
          p={{ xs: 1.5, sm: 2, md: "18px" }}
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "12px",
            height: { xs: 240, sm: 280, md: 420 },
          }}
        >
          <Box mb="8px" sx={{ minWidth: 0, flexShrink: 0 }}>
            <Typography
              variant={isXs ? "body1" : "h6"}
              fontWeight="700"
              color={colors.grey[100]}
            >
              Expense by Category
            </Typography>
            <Typography
              variant={isXs ? "body2" : "body1"}
              color={colors.greenAccent[500]}
            >
              Spending Overview (Today)
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  left: isXs ? 0 : 4,
                  right: isXs ? 0 : 4,
                  top: 8,
                  bottom: isXs ? 28 : isMd ? 20 : 8,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={isXs ? -25 : isMd ? -15 : 0}
                  textAnchor={isXs || isMd ? "end" : "middle"}
                  height={isXs ? 56 : isMd ? 42 : 30}
                  tick={{ fontSize: isXs ? 9 : 11 }}
                />
                <YAxis
                  width={isXs ? 30 : 42}
                  tick={{ fontSize: isXs ? 9 : 11 }}
                />
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
                <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={isXs ? 28 : 42}>
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

        <Box
          gridColumn={{ xs: "1 / -1", md: "span 4" }}
          gridRow={{ xs: "auto", md: "span 3" }}
          backgroundColor={colors.primary[400]}
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "12px",
            height: { xs: 260, sm: 300, md: 420 },
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`2px solid ${colors.primary[500]}`}
            p={{ xs: "12px", md: "15px" }}
            sx={{ flexShrink: 0 }}
          >
            <Typography
              color={colors.grey[100]}
              variant={isXs ? "body1" : "h6"}
              fontWeight="700"
            >
              Recent Transactions
            </Typography>
          </Box>

          <Box sx={{ overflow: "auto", flex: 1 }}>
            {recent.length === 0 && !loading ? (
              <Box p={2}>
                <Typography color={colors.grey[300]}>
                  No recent transactions
                </Typography>
              </Box>
            ) : (
              recent.map((tx, i) => (
                <Box
                  key={`${tx.id || "tx"}-${i}`}
                  display="flex"
                  flexDirection="column"
                  gap={0.75}
                  borderBottom={`1px solid ${colors.primary[500]}`}
                  p={{ xs: "12px", md: "15px" }}
                  sx={{ minWidth: 0 }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={0.75}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        color={colors.greenAccent[500]}
                        variant="body1"
                        fontWeight="700"
                        sx={{ wordBreak: "break-word" }}
                      >
                        {tx.category || "Others"}
                      </Typography>
                      <Typography
                        color={colors.grey[100]}
                        sx={{
                          opacity: 0.95,
                          wordBreak: "break-word",
                          fontSize: { xs: 12, md: 14 },
                        }}
                      >
                        {tx.bank || "-"}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        backgroundColor: colors.greenAccent[500],
                        px: 1,
                        py: 0.5,
                        borderRadius: "6px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        color: "#111",
                        alignSelf: { xs: "flex-start", sm: "center" },
                        fontSize: { xs: 12, md: 14 },
                      }}
                    >
                      {fmtMoney(tx.amount)} ฿
                    </Box>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={0.5}
                  >
                    <Typography
                      color={colors.grey[300]}
                      sx={{ fontSize: 12, wordBreak: "break-word" }}
                    >
                      {tx.date || "-"}
                    </Typography>

                    {tx.file_url && (
                      <a
                        href={tx.file_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: colors.greenAccent[300],
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        View Slip
                      </a>
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Box>

      <GoalPopup
        open={goalPopupOpen}
        onClose={() => setGoalPopupOpen(false)}
        onSaved={() => setGoalPopupOpen(false)}
      />
    </Box>
  );
};

export default Dashboard;