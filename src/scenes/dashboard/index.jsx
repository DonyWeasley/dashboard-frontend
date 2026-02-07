import {
  Box,
  Typography,
  useTheme,
  Button,
  ButtonGroup,
  Alert,
  CircularProgress,
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

  const [range, setRange] = useState("month");

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
        if (!res.ok) {
          throw new Error(text || `HTTP ${res.status}`);
        }

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
  }, [range]);

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
  const monthExp = cards?.total_monthly_expense || { value: 0, pct: 0 };
  const monthTx = cards?.total_transactions || { value: 0, pct: 0 };
  const topCat = cards?.top_spending_category || {
    category: "Others",
    value: 0,
    pct: 0,
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
        sx={{ position: "relative" }}
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

        {/* Card 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box textAlign="center">
            <Typography
              variant="h5"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "6px" }}
            >
              Total per Day
            </Typography>
            <Typography
              variant="h1"
              fontWeight="bold"
              color={colors.greenAccent[500]}
              sx={{ lineHeight: 1 }}
            >
              {fmtMoney(avgDay.value)} ฿
            </Typography>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ mt: "4px" }}
            >
              Daily Spending
            </Typography>
            <Typography
              variant="subtitle1"
              color={pctColor(colors, avgDay.pct)}
              sx={{ mt: "6px" }}
            >
              {pctText(avgDay.pct)} from yesterday
            </Typography>
          </Box>
        </Box>

        {/* Card 2 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box textAlign="center">
            <Typography
              variant="h5"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "6px" }}
            >
              Total Monthly Expense
            </Typography>
            <Typography
              variant="h1"
              fontWeight="bold"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1 }}
            >
              {fmtMoney(monthExp.value)} ฿
            </Typography>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ mt: "4px" }}
            >
              Monthly Spending
            </Typography>
            <Typography
              variant="subtitle1"
              color={pctColor(colors, monthExp.pct)}
              sx={{ mt: "6px" }}
            >
              {pctText(monthExp.pct)} from last month
            </Typography>
          </Box>
        </Box>

        {/* Card 3 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box textAlign="center">
            <Typography
              variant="h5"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "6px" }}
            >
              Total Transactions
            </Typography>
            <Typography
              variant="h1"
              fontWeight="bold"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1 }}
            >
              {monthTx.value ?? 0}
            </Typography>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ mt: "4px" }}
            >
              Transactions This Month
            </Typography>
            <Typography
              variant="subtitle1"
              color={pctColor(colors, monthTx.pct)}
              sx={{ mt: "6px" }}
            >
              {pctText(monthTx.pct)} from last month
            </Typography>
          </Box>
        </Box>

        {/* Card 4 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box textAlign="center">
            <Typography
              variant="h5"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "6px" }}
            >
              Top Spending Category
            </Typography>
            <Typography
              variant="h2"
              fontWeight="bold"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1 }}
            >
              {topCat.category || "Others"}
            </Typography>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ mt: "4px" }}
            >
              Most Spending Category
            </Typography>
            <Typography
              variant="subtitle1"
              color={pctColor(colors, topCat.pct)}
              sx={{ mt: "6px" }}
            >
              {pctText(topCat.pct)} from last month
            </Typography>
          </Box>
        </Box>

        {/* Chart */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          p="20px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb="10px"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Expense by Category
              </Typography>
              <Typography variant="h6" color={colors.greenAccent[500]}>
                Spending Overview
              </Typography>
            </Box>

            <ButtonGroup
              size="small"
              variant="outlined"
              sx={{
                borderColor: colors.greenAccent[500],
                "& .MuiButton-root": {
                  textTransform: "none",
                  fontWeight: 800,
                  borderColor: colors.greenAccent[500],
                  color: colors.greenAccent[300],
                  transition: "0.15s",
                },
                "& .MuiButton-root:hover": {
                  backgroundColor: colors.primary[600],
                  borderColor: colors.greenAccent[400],
                },
              }}
            >
              <Button
                onClick={() => setRange("today")}
                sx={{
                  backgroundColor:
                    range === "today" ? colors.greenAccent[600] : "transparent",
                  color:
                    range === "today"
                      ? colors.primary[900]
                      : colors.greenAccent[300],
                  borderColor:
                    range === "today"
                      ? colors.greenAccent[600]
                      : colors.greenAccent[500],
                  "&:hover": {
                    backgroundColor:
                      range === "today"
                        ? colors.greenAccent[700]
                        : colors.primary[600],
                  },
                }}
              >
                Today
              </Button>

              <Button
                onClick={() => setRange("month")}
                sx={{
                  backgroundColor:
                    range === "month" ? colors.greenAccent[600] : "transparent",
                  color:
                    range === "month"
                      ? colors.primary[900]
                      : colors.greenAccent[300],
                  borderColor:
                    range === "month"
                      ? colors.greenAccent[600]
                      : colors.greenAccent[500],
                  "&:hover": {
                    backgroundColor:
                      range === "month"
                        ? colors.greenAccent[700]
                        : colors.primary[600],
                  },
                }}
              >
                This Month
              </Button>

              <Button
                onClick={() => setRange("year")}
                sx={{
                  backgroundColor:
                    range === "year" ? colors.greenAccent[600] : "transparent",
                  color:
                    range === "year"
                      ? colors.primary[900]
                      : colors.greenAccent[300],
                  borderColor:
                    range === "year"
                      ? colors.greenAccent[600]
                      : colors.greenAccent[500],
                  "&:hover": {
                    backgroundColor:
                      range === "year"
                        ? colors.greenAccent[700]
                        : colors.primary[600],
                  },
                }}
              >
                This Year
              </Button>
            </ButtonGroup>
          </Box>

          <Box height="260px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${fmtMoney(value)} ฿`, "Total"]}
                  contentStyle={{
                    backgroundColor: colors.primary[500],
                    border: `1px solid ${colors.white}`,
                    borderRadius: 8,
                  }}
                  labelStyle={{
                    color: colors.white,
                    fontWeight: 800,
                  }}
                  itemStyle={{
                    color: colors.white, 
                  }}
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

        {/* Recent */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>

          {recent.map((tx, i) => (
            <Box
              key={`${tx.id}-${i}`}
              display="flex"
              alignItems="flex-start"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box sx={{ width: "50%" }}>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {tx.category || "Others"}
                </Typography>
                <Typography color={colors.grey[100]}>
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
                sx={{ width: "25%", textAlign: "center" }}
                color={colors.grey[100]}
              >
                {tx.date || "-"}
              </Box>

              <Box
                sx={{
                  width: "25%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Box
                  sx={{
                    width: "90px",
                    textAlign: "center",
                    backgroundColor: colors.greenAccent[500],
                    p: "5px 10px",
                    borderRadius: "4px",
                    fontWeight: 600,
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
  );
};

export default Dashboard;
