import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Stack,
  TextField,
  MenuItem,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

/* Month options (เดิม) */
const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];


const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const StatisticalInformations = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);


  const [filterType, setFilterType] = useState("all"); // all | month | year
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState("2026");


  const [cards, setCards] = useState({
    total_expenses: 0,
    top_category: "Others",
    top_bank: "-",
    total_transactions: 0,
  });
  const [expensesOverTime, setExpensesOverTime] = useState([]); // [{x,total}]
  const [bankDist, setBankDist] = useState([]); // [{bank,total}]
  const [categoryExpenses, setCategoryExpenses] = useState([]); // [{category,total}]

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");


  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setErr("");

      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const params = new URLSearchParams();
        params.set("range", filterType);

        if (filterType === "month") {
          params.set("year", year);
          params.set("month", String(parseInt(month, 10))); // backend ใช้ 1-12
        } else if (filterType === "year") {
          params.set("year", year);
        }

        const res = await fetch(`${API_BASE}/stats?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();

        setCards(data?.cards || {});
        setExpensesOverTime(Array.isArray(data?.expenses_over_time) ? data.expenses_over_time : []);
        setBankDist(Array.isArray(data?.bank_distribution) ? data.bank_distribution : []);
        setCategoryExpenses(Array.isArray(data?.category_expenses) ? data.category_expenses : []);
      } catch (e) {
        setErr(e?.message || "Failed to load statistics");
        setCards({
          total_expenses: 0,
          top_category: "Others",
          top_bank: "-",
          total_transactions: 0,
        });
        setExpensesOverTime([]);
        setBankDist([]);
        setCategoryExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filterType, month, year]);

  // ----------------------------
  // ✅ แปลง data ให้ Nivo ใช้ได้
  // ----------------------------


  const lineData = useMemo(() => {
    const dataPoints = (expensesOverTime || []).map((p) => {
      const xRaw = p?.x;
      let xLabel = String(xRaw ?? "");

      if (filterType === "year") {
        const mm = Number(xRaw);
        xLabel = months[mm - 1]?.label || String(xRaw);
      }

      return { x: xLabel, y: Number(p?.total || 0) };
    });

    return [
      {
        id: "Expenses",
        data: dataPoints,
      },
    ];
  }, [expensesOverTime, filterType]);


  const pieData = useMemo(() => {
    return (bankDist || [])
      .filter((b) => Number(b?.total || 0) > 0)
      .map((b) => ({
        id: b.bank || "-",
        label: b.bank || "-",
        value: Number(b.total || 0),
      }));
  }, [bankDist]);


  const barData = useMemo(() => {
    return (categoryExpenses || []).map((c) => ({
      category: c.category || "Others",
      amount: Number(c.total || 0),
    }));
  }, [categoryExpenses]);

  return (
    <Box m="20px">
      <Header title="STATISTICAL INFORMATION" subtitle="Overview of Expenses" />

      {/* ✅ Error */}
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {/* Filter Section */}
      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        <TextField
          select
          size="small"
          label="Filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ width: 140 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="month">By Month</MenuItem>
          <MenuItem value="year">By Year</MenuItem>
        </TextField>

        {filterType === "month" && (
          <TextField
            select
            size="small"
            label="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            sx={{ width: 160 }}
          >
            {months.map((m) => (
              <MenuItem key={m.value} value={m.value}>
                {m.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        {filterType !== "all" && (
          <TextField
            select
            size="small"
            label="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{ width: 120 }}
          >
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
            <MenuItem value="2026">2026</MenuItem>
          </TextField>
        )}
      </Stack>

      {/* ✅ Loading overlay แบบไม่ทำ UI พัง */}
      {loading && (
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <CircularProgress size={18} />
          <Typography color={colors.grey[200]}>Loading statistics…</Typography>
        </Box>
      )}

      {/* Summary Section */}
      <Stack direction="row" spacing={1.5} mb={2} sx={{ width: "100%", alignItems: "stretch" }}>
        <Paper sx={{ flex: 1, p: 1.25, minHeight: 120, bgcolor: colors.primary[400], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color={colors.grey[200]} fontWeight="600" sx={{ mb: "2px" }}>
              Total Expenses
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]} sx={{ lineHeight: 1.1 }}>
              {fmtMoney(cards.total_expenses)} ฿
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Total Spending (filtered)
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, p: 1.25, minHeight: 120, bgcolor: colors.primary[400], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color={colors.grey[200]} fontWeight="600" sx={{ mb: "2px" }}>
              Top Category
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={colors.greenAccent[400]} sx={{ lineHeight: 1.1 }}>
              {cards.top_category || "Others"}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Highest spending category
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, p: 1.25, minHeight: 120, bgcolor: colors.primary[400], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color={colors.grey[200]} fontWeight="600" sx={{ mb: "2px" }}>
              Top Bank
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[400]} sx={{ lineHeight: 1.1 }}>
              {cards.top_bank || "-"}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Highest spending bank
            </Typography>
          </Box>
        </Paper>

        <Paper sx={{ flex: 1, p: 1.25, minHeight: 120, bgcolor: colors.primary[400], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box textAlign="center">
            <Typography variant="subtitle2" color={colors.grey[200]} fontWeight="600" sx={{ mb: "2px" }}>
              Total Transactions
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[400]} sx={{ lineHeight: 1.1 }}>
              {cards.total_transactions ?? 0}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Slips uploaded (filtered)
            </Typography>
          </Box>
        </Paper>
      </Stack>

      {/* Charts Section */}
      <Stack direction="row" spacing={2} mb={2} sx={{ height: "360px" }}>
        {/* Line Chart */}
        <Paper sx={{ flex: 2, p: 2, bgcolor: colors.primary[400], display: "flex", flexDirection: "column" }}>
          <Typography mb={1.5} fontWeight="600">
            Expenses Over Time
          </Typography>

          <ResponsiveLine
            data={lineData}
            theme={{
              axis: {
                domain: { line: { stroke: colors.grey[100] } },
                ticks: { line: { stroke: colors.grey[100], strokeWidth: 1 }, text: { fill: colors.grey[100] } },
                legend: { text: { fill: colors.grey[100] } },
              },
              tooltip: { container: { color: colors.primary[500] } },
            }}
            margin={{ top: 30, right: 40, bottom: 60, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            curve="catmullRom"
            axisTop={null}
            axisRight={null}
            axisBottom={{ tickRotation: -45, tickPadding: 8, tickSize: 0 }}
            axisLeft={{ legend: "Amount (฿)", legendPosition: "middle", legendOffset: -40 }}
            colors={{ scheme: "nivo" }}
            pointSize={8}
            pointColor={{ theme: "background" }}
            pointBorderWidth={2}
            pointBorderColor={{ from: "serieColor" }}
            enableArea={true}
            areaOpacity={0.25}
            enableGridX={false}
            enableGridY={false}
            useMesh={true}
          />
        </Paper>

        {/* Pie / Donut Chart */}
        <Paper sx={{ flex: 1, p: 2, bgcolor: colors.primary[400], display: "flex", flexDirection: "column" }}>
          <Typography mb={1.5} fontWeight="600">
            Bank Distribution
          </Typography>

          <ResponsivePie
            data={pieData}
            theme={{
              legends: { text: { fill: colors.grey[100] } },
              tooltip: { container: { color: colors.primary[500] } },
            }}
            margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "set2" }}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            enableArcLabels={false}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={colors.grey[100]}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            useMesh={true}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                translateY: 50,
                itemsSpacing: 10,
                itemWidth: 90,
                itemHeight: 18,
                itemTextColor: colors.grey[100],
                itemOpacity: 0.85,
                symbolSize: 12,
                symbolShape: "circle",
                effects: [{ on: "hover", style: { itemOpacity: 1 } }],
              },
            ]}
          />
        </Paper>
      </Stack>

      {/* Horizontal Bar Chart */}
      <Paper
        elevation={3}
        sx={{
          height: "400px",
          p: 2.5,
          bgcolor: colors.primary[400],
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
        }}
      >
        <Typography mb={2} fontWeight="600" variant="h6" color={colors.grey[100]}>
          Category Expenses
        </Typography>

        <ResponsiveBar
          data={barData}
          layout="horizontal"
          theme={{
            axis: {
              domain: { line: { stroke: colors.grey[300] } },
              ticks: { line: { stroke: colors.grey[300] }, text: { fill: colors.grey[200], fontSize: 12 } },
              legend: { text: { fill: colors.grey[200], fontSize: 13 } },
            },
            tooltip: {
              container: {
                background: colors.primary[500],
                color: colors.grey[100],
                fontSize: 13,
                borderRadius: 6,
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
              },
            },
          }}
          keys={["amount"]}
          indexBy="category"
          margin={{ top: 10, right: 40, bottom: 50, left: 110 }}
          padding={0.35}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={{ scheme: "set2" }}
          colorBy="indexValue"
          borderRadius={8}
          borderColor={{ from: "color", modifiers: [["darker", 1.4]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            legend: "Amount (฿)",
            legendPosition: "middle",
            legendOffset: 40,
            tickSize: 0,
            tickPadding: 8,
          }}
          axisLeft={{ tickSize: 0, tickPadding: 10 }}
          enableLabel={false}
          enableGridX={false}
          enableGridY={false}
          animate={true}
          motionConfig="gentle"
          useMesh={true}
        />
      </Paper>
    </Box>
  );
};

export default StatisticalInformations;
