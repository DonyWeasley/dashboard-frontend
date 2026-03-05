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
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveBoxPlot } from "@nivo/boxplot";
import { ResponsiveHeatMap } from "@nivo/heatmap";

/* Month options */
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

// ✅ banks & categories (mock + ordering)
const BANKS = ["KBank", "SCB", "BBL", "Krungsri", "TTB"];
const CATEGORIES = ["Food", "Transport", "Shopping", "Utilities", "Others"];
const PAYING_TYPES = ["QR", "Transfer", "Card"];

const getDaysInMonth = (year, month) => {
  return new Date(Number(year), Number(month), 0).getDate();
};

/** ✅ ONLY MOCK MODE */
const makeMockStats = (filterType, year, month) => {
  const rand = (min, max) =>
    Math.round((min + Math.random() * (max - min)) * 100) / 100;

  const daysInMonth = filterType === "month" ? getDaysInMonth(year, month) : 31;
  const timeBuckets =
    filterType === "year"
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const expenses_over_time = timeBuckets.map((t) => ({
    x: t,
    total: rand(80, 6500),
  }));

  const category_bank_stacks = [];
  CATEGORIES.forEach((cat) => {
    BANKS.forEach((bank) => {
      const base =
        cat === "Utilities"
          ? rand(600, 5200)
          : cat === "Shopping"
            ? rand(400, 6200)
            : cat === "Transport"
              ? rand(300, 4800)
              : cat === "Food"
                ? rand(200, 4200)
                : rand(150, 2200);

      category_bank_stacks.push({ category: cat, bank, total: base });
    });
  });

  const box_whisker = [];
  CATEGORIES.forEach((cat) => {
    PAYING_TYPES.forEach((pt) => {
      const count = 10 + Math.floor(Math.random() * 10);
      const values = Array.from({ length: count }, () => {
        const base =
          cat === "Utilities"
            ? rand(200, 3500)
            : cat === "Shopping"
              ? rand(120, 3000)
              : cat === "Transport"
                ? rand(120, 4200)
                : cat === "Food"
                  ? rand(30, 1500)
                  : rand(20, 1200);

        const ptBoost = pt === "Card" ? 1.25 : pt === "Transfer" ? 1.1 : 1;
        return Math.round(base * ptBoost);
      });
      box_whisker.push({ category: cat, paying_type: pt, values });
    });
  });

  const bank_heatmap = BANKS.map((bank) => ({
    bank,
    values: timeBuckets.map((t) => ({
      x: String(filterType === "year" ? months[t - 1].label.slice(0, 3) : t),
      y: rand(0, 9000),
    })),
  }));

  const total_expenses = category_bank_stacks.reduce(
    (s, r) => s + Number(r.total || 0),
    0
  );
  const total_transactions = Math.floor(rand(18, 120));

  const catSum = {};
  const bankSum = {};
  category_bank_stacks.forEach((r) => {
    catSum[r.category] = (catSum[r.category] || 0) + r.total;
    bankSum[r.bank] = (bankSum[r.bank] || 0) + r.total;
  });

  const top_category =
    Object.entries(catSum).sort((a, b) => b[1] - a[1])[0]?.[0] || "Others";
  const top_bank =
    Object.entries(bankSum).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  return {
    cards: { total_expenses, top_category, top_bank, total_transactions },
    expenses_over_time,
    category_bank_stacks,
    box_whisker,
    bank_heatmap,
    meta: { mock: true, range: filterType, year, month },
  };
};

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

  const [expensesOverTime, setExpensesOverTime] = useState([]);
  const [categoryBankStacks, setCategoryBankStacks] = useState([]);
  const [boxWhisker, setBoxWhisker] = useState([]);
  const [bankHeatmap, setBankHeatmap] = useState([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Accent colors: match dashboard (greenAccent)
  const ACCENT = useMemo(
    () => ({
      line: colors.greenAccent[400],
      lineDark: colors.greenAccent[500],
      pointBorder: colors.greenAccent[700],
      avg: colors.greenAccent[200],
      areaOpacity: 0.16,
      // bank colors (all in green/teal family like dashboard)
      bank: {
        KBank: colors.greenAccent[200],
        SCB: colors.greenAccent[300],
        BBL: colors.greenAccent[400],
        Krungsri: colors.greenAccent[500],
        TTB: colors.greenAccent[600],
        "-": colors.grey[400],
      },
      paying: {
        QR: colors.greenAccent[200],
        Transfer: colors.greenAccent[400],
        Card: colors.greenAccent[600],
        Unknown: colors.grey[400],
      },
    }),
    [colors]
  );

  const nivoTheme = useMemo(() => {
    const txt = colors.grey[100];
    const axis = colors.grey[300];
    return {
      axis: {
        domain: { line: { stroke: axis } },
        ticks: {
          line: { stroke: axis, strokeWidth: 1 },
          text: { fill: txt, fontSize: 12 },
        },
        legend: { text: { fill: txt, fontSize: 12 } },
      },
      legends: { text: { fill: txt, fontSize: 12 } },
      labels: { text: { fill: txt } },
      tooltip: {
        container: {
          background: colors.primary[500],
          color: txt,
          fontSize: 13,
          borderRadius: 12,
          boxShadow: "0 12px 28px rgba(0,0,0,0.40)",
          padding: "10px 12px",
          border: `1px solid ${colors.primary[300]}`,
        },
      },
      grid: { line: { stroke: colors.grey[800], strokeWidth: 1 } },
    };
  }, [colors]);

  // ✅ ONLY MOCK: generate whenever filter changes
  useEffect(() => {
    const loadMock = async () => {
      setLoading(true);
      setErr("");
      try {
        await new Promise((r) => setTimeout(r, 250));

        const mock = makeMockStats(filterType, year, month);
        setCards(mock.cards);
        setExpensesOverTime(mock.expenses_over_time);
        setCategoryBankStacks(mock.category_bank_stacks);
        setBoxWhisker(mock.box_whisker);
        setBankHeatmap(mock.bank_heatmap);
      } catch (e) {
        setErr(e?.message || "Failed to load mock statistics");
      } finally {
        setLoading(false);
      }
    };

    loadMock();
  }, [filterType, month, year]);

  const lineData = useMemo(() => {
    const series = (expensesOverTime || [])
      .map((p) => {
        const xNum = Number(p?.x);
        const yNum = Number(p?.total);
        if (!Number.isFinite(xNum) || !Number.isFinite(yNum)) return null;

        const xLabel =
          filterType === "year"
            ? months[xNum - 1]?.label?.slice(0, 3) || String(xNum)
            : String(xNum).padStart(2, "0");

        return { x: xLabel, y: yNum };
      })
      .filter(Boolean);

    return [{ id: "Expenses", data: series }];
  }, [expensesOverTime, filterType]);

  const avgValue = useMemo(() => {
    const ys = (lineData?.[0]?.data || [])
      .map((d) => Number(d?.y))
      .filter(Number.isFinite);

    if (!ys.length) return 0;
    return ys.reduce((a, b) => a + b, 0) / ys.length;
  }, [lineData]);

  const quadHeight = { xs: 420, sm: 460, md: 380 };

  const emptyMsg = (text) => (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "grid",
        placeItems: "center",
        opacity: 0.92,
        border: `1px dashed ${colors.grey[700]}`,
        borderRadius: 2,
      }}
    >
      <Typography color={colors.grey[200]}>{text}</Typography>
    </Box>
  );

  // ✅ Make cards/charts look like dashboard cards
  const chartCardSx = {
    p: 2,
    bgcolor: colors.primary[400],
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    height: quadHeight,
    borderRadius: "14px",
    boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
    border: `1px solid ${colors.primary[300]}`,
  };

  const filterFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: colors.primary[400],
    },
    "& .MuiInputLabel-root": { color: colors.grey[200] },
  };

  // chart 2/3/4 prep
  const stackedBar = useMemo(() => {
    const rows = Array.isArray(categoryBankStacks) ? categoryBankStacks : [];

    const categories = CATEGORIES.filter((c) =>
      rows.some((r) => (r?.category || "") === c)
    );

    const banks = Array.from(new Set(rows.map((r) => r?.bank).filter(Boolean)));
    const orderedBanks = BANKS.filter((b) => banks.includes(b));
    const keys = orderedBanks.length ? orderedBanks : banks;

    const byCategory = new Map();
    categories.forEach((c) => byCategory.set(c, { category: c }));

    rows.forEach((r) => {
      const c = r?.category || "Others";
      const b = r?.bank || "-";
      const amt = Number(r?.total || 0);
      if (!byCategory.has(c)) byCategory.set(c, { category: c });
      byCategory.get(c)[b] = (byCategory.get(c)[b] || 0) + amt;
    });

    return { keys, data: Array.from(byCategory.values()) };
  }, [categoryBankStacks]);

  const boxPlotData = useMemo(() => {
    const rows = Array.isArray(boxWhisker) ? boxWhisker : [];

    const points = [];
    rows.forEach((r) => {
      const group = r?.category || "Others";
      const id = r?.paying_type || "Unknown";

      (r?.values || []).forEach((v) => {
        const n = Number(v);
        if (Number.isFinite(n)) points.push({ group, id, value: n });
      });
    });

    const ordered = [];
    CATEGORIES.forEach((cat) => {
      PAYING_TYPES.forEach((pt) => {
        points.forEach((p) => {
          if (p.group === cat && p.id === pt) ordered.push(p);
        });
      });
    });

    return ordered.length ? ordered : points;
  }, [boxWhisker]);

  const heatmapData = useMemo(() => {
    const rows = Array.isArray(bankHeatmap) ? bankHeatmap : [];
    const map = new Map(rows.map((r) => [r?.bank, r]));

    return BANKS.filter((b) => map.has(b)).map((b) => ({
      id: b,
      data: (map.get(b)?.values || []).map((v) => ({
        x: String(v?.x ?? ""),
        y: Number.isFinite(Number(v?.y)) ? Number(v.y) : 0,
      })),
    }));
  }, [bankHeatmap]);

  const heatMax = useMemo(() => {
    const vals = heatmapData.flatMap((r) => r.data.map((d) => d.y));
    const m = Math.max(...vals, 0);
    return m > 0 ? m : 1;
  }, [heatmapData]);

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Header title="STATISTICAL INFORMATION" subtitle="Overview of Expenses" />

      {err && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
          {err}
        </Alert>
      )}

      {/* ✅ Filters (match dashboard inputs) */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          select
          size="small"
          label="Filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          sx={{ width: { xs: "100%", sm: 170 }, ...filterFieldSx }}
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
            sx={{ width: { xs: "100%", sm: 220 }, ...filterFieldSx }}
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
            sx={{ width: { xs: "100%", sm: 150 }, ...filterFieldSx }}
          >
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
            <MenuItem value="2026">2026</MenuItem>
          </TextField>
        )}
      </Stack>

      {loading && (
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <CircularProgress size={18} />
          <Typography color={colors.grey[200]}>Loading statistics…</Typography>
        </Box>
      )}

      {/* ✅ Summary cards (same look as dashboard cards) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <Paper
          sx={{
            p: 2,
            minHeight: 120,
            bgcolor: colors.primary[400],
            borderRadius: "14px",
            border: `1px solid ${colors.primary[300]}`,
            boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="800"
              sx={{ mb: "4px" }}
            >
              Total Expenses
            </Typography>
            <Typography
              variant="h4"
              fontWeight="900"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1.1 }}
            >
              {fmtMoney(cards.total_expenses)} ฿
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Total Spending (filtered)
            </Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            minHeight: 120,
            bgcolor: colors.primary[400],
            borderRadius: "14px",
            border: `1px solid ${colors.primary[300]}`,
            boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="800"
              sx={{ mb: "4px" }}
            >
              Top Category
            </Typography>
            <Typography
              variant="h5"
              fontWeight="900"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1.1 }}
            >
              {cards.top_category || "Others"}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Highest spending category
            </Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            minHeight: 120,
            bgcolor: colors.primary[400],
            borderRadius: "14px",
            border: `1px solid ${colors.primary[300]}`,
            boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="800"
              sx={{ mb: "4px" }}
            >
              Top Bank
            </Typography>
            <Typography
              variant="h4"
              fontWeight="900"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1.1 }}
            >
              {cards.top_bank || "-"}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Highest spending bank
            </Typography>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            minHeight: 120,
            bgcolor: colors.primary[400],
            borderRadius: "14px",
            border: `1px solid ${colors.primary[300]}`,
            boxShadow: "0 12px 26px rgba(0,0,0,0.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="800"
              sx={{ mb: "4px" }}
            >
              Total Transactions
            </Typography>
            <Typography
              variant="h4"
              fontWeight="900"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1.1 }}
            >
              {cards.total_transactions ?? 0}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Slips uploaded (filtered)
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ✅ 4 CHARTS: 2x2 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {/* 1) LINE CHART */}
        <Paper sx={chartCardSx}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography fontWeight="900" color={colors.grey[100]}>
              1) Expenses Over Time
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              X: {filterType === "year" ? "Month" : "Day"} • Y: Amount (฿)
            </Typography>
          </Stack>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {!lineData?.[0]?.data?.length ? (
              emptyMsg("No data for line chart")
            ) : (
              <ResponsiveLine
                data={lineData}
                theme={nivoTheme}
                margin={{ top: 30, right: 30, bottom: 60, left: 70 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: "auto" }}
                curve="catmullRom"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  legend: filterType === "year" ? "Month" : "Day",
                  legendPosition: "middle",
                  legendOffset: 42,
                  tickRotation: -25,
                  tickPadding: 10,
                  tickSize: 0,
                  tickValues:
                    filterType === "year"
                      ? [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ]
                      : (() => {
                          const xs = (lineData?.[0]?.data || []).map((d) => d.x);
                          const last = Number(xs[xs.length - 1] || 0);
                          const fixed = [1, 5, 10, 15, 20, 25].filter(
                            (d) => d <= last
                          );
                          if (last && !fixed.includes(last)) fixed.push(last);
                          return fixed.map((d) => String(d).padStart(2, "0"));
                        })(),
                }}
                axisLeft={{
                  legend: "Amount (Baht)",
                  legendPosition: "middle",
                  legendOffset: -50,
                  tickSize: 0,
                  tickPadding: 10,
                  format: (v) => fmtMoney(v),
                }}
                colors={[ACCENT.line]}
                lineWidth={3}
                pointSize={7}
                pointColor={ACCENT.line}
                pointBorderWidth={2}
                pointBorderColor={ACCENT.pointBorder}
                enableArea
                areaOpacity={ACCENT.areaOpacity}
                enableGridX={false}
                enableGridY
                useMesh
                enablePointLabel={false}
                markers={[
                  {
                    axis: "y",
                    value: avgValue,
                    lineStyle: {
                      stroke: ACCENT.avg,
                      strokeWidth: 3,
                      strokeDasharray: "8 6",
                    },
                    legend: `Average ${fmtMoney(avgValue)} ฿`,
                    legendPosition: "top-left",
                    textStyle: {
                      fill: ACCENT.avg,
                      fontSize: 12,
                      fontWeight: 800,
                    },
                  },
                ]}
                tooltip={({ point }) => (
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>
                      {filterType === "year" ? "Month" : "Day"}:{" "}
                      {point.data.xFormatted}
                    </div>
                    <div style={{ color: ACCENT.line }}>
                      Amount: {fmtMoney(point.data.yFormatted)} ฿
                    </div>
                  </div>
                )}
              />
            )}
          </Box>
        </Paper>

        {/* 2) STACKED BAR */}
        <Paper sx={chartCardSx}>
          <Typography fontWeight="900" color={colors.grey[100]} mb={1}>
            2) Category by Bank (Stacked)
          </Typography>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {!stackedBar?.data?.length || !stackedBar?.keys?.length ? (
              emptyMsg("No data")
            ) : (
              <ResponsiveBar
                data={stackedBar.data}
                keys={stackedBar.keys}
                indexBy="category"
                groupMode="stacked"
                layout="vertical"
                theme={nivoTheme}
                margin={{ top: 48, right: 20, bottom: 55, left: 60 }}
                padding={0.35}
                innerPadding={0}
                colors={({ id }) => ACCENT.bank[id] || ACCENT.bank["-"]}
                borderRadius={0}
                borderWidth={0}
                valueScale={{ type: "linear" }}
                indexScale={{ type: "band", round: true }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickRotation: 0,
                  tickPadding: 8,
                  tickSize: 0,
                  legend: "Category",
                  legendPosition: "middle",
                  legendOffset: 40,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  legend: "Amount (฿)",
                  legendPosition: "middle",
                  legendOffset: -48,
                  format: (v) => fmtMoney(v),
                }}
                enableGridY={true}
                enableGridX={false}
                enableLabel={false}
                legends={[
                  {
                    anchor: "top",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: -42,
                    itemsSpacing: 14,
                    itemWidth: 85,
                    itemHeight: 18,
                    itemOpacity: 1,
                    symbolSize: 12,
                    symbolShape: "square",
                  },
                ]}
                tooltip={({ id, value, indexValue }) => (
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>
                      {indexValue} • {id}
                    </div>
                    <div>Amount: {fmtMoney(value)} ฿</div>
                  </div>
                )}
                animate
                motionConfig="gentle"
              />
            )}
          </Box>
        </Paper>

        {/* 3) BOXPLOT */}
        <Paper sx={chartCardSx}>
          <Typography fontWeight="900" color={colors.grey[100]} mb={1}>
            3) Spending Spread (Box Plot)
          </Typography>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {!boxPlotData?.length ? (
              emptyMsg("No data")
            ) : (
              <ResponsiveBoxPlot
                data={boxPlotData}
                groupBy="group"
                subGroupBy="id"
                theme={nivoTheme}
                layout="vertical"
                margin={{ top: 10, right: 20, bottom: 70, left: 60 }}
                colorBy="subGroup"
                colors={[
                  ACCENT.paying.QR,
                  ACCENT.paying.Transfer,
                  ACCENT.paying.Card,
                ]}
                borderRadius={10}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
                medianWidth={2}
                whiskerWidth={1}
                whiskerEndSize={0.6}
                axisBottom={{
                  legend: "Category",
                  legendPosition: "middle",
                  legendOffset: 52,
                }}
                axisLeft={{
                  legend: "Amount (฿)",
                  legendPosition: "middle",
                  legendOffset: -48,
                }}
              />
            )}
          </Box>
        </Paper>

        {/* 4) HEATMAP */}
        <Paper sx={chartCardSx}>
          <Typography fontWeight="900" color={colors.grey[100]} mb={1}>
            4) Bank Heatmap
          </Typography>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {!heatmapData?.length ? (
              emptyMsg("No data")
            ) : (
              <ResponsiveHeatMap
                data={heatmapData}
                theme={nivoTheme}
                margin={{ top: 10, right: 90, bottom: 60, left: 95 }}
                // ✅ เปลี่ยน scheme เป็น greens ให้เข้ากับ dashboard
                colors={{
                  type: "sequential",
                  scheme: "greens",
                  minValue: 0,
                  maxValue: heatMax,
                }}
                emptyColor={colors.primary[500]}
                forceSquare={false}
                sizeVariation={0}
                cellOpacity={1}
                cellBorderWidth={1}
                cellBorderColor={{
                  from: "color",
                  modifiers: [["darker", 0.25]],
                }}
                enableLabels={false} // ✅ ปิด label ใน cell (ของคุณในรูปมันแน่น/รก)
                legends={[
                  {
                    anchor: "right",
                    translateX: 60,
                    translateY: 0,
                    length: 220,
                    thickness: 12,
                    direction: "column",
                    tickPosition: "after",
                    tickSize: 3,
                    tickSpacing: 6,
                    tickOverlap: false,
                    title: "Amount (฿)",
                    titleAlign: "start",
                    titleOffset: 6,
                  },
                ]}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 10,
                  tickRotation: -25,
                  legend: filterType === "year" ? "Month" : "Day",
                  legendPosition: "middle",
                  legendOffset: 45,
                  tickValues:
                    filterType === "year"
                      ? [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ]
                      : (() => {
                          const xs = (lineData?.[0]?.data || []).map((d) => d.x);
                          const last = Number(xs[xs.length - 1] || 0);
                          const fixed = [1, 5, 10, 15, 20, 25].filter(
                            (d) => d <= last
                          );
                          if (last && !fixed.includes(last)) fixed.push(last);
                          return fixed.map((d) => String(d).padStart(2, "0"));
                        })(),
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 10,
                  legend: "Bank",
                  legendPosition: "middle",
                  legendOffset: -70,
                }}
                tooltip={({ xKey, yKey, value }) => (
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>
                      {yKey} • {xKey}
                    </div>
                    <div>Amount: {fmtMoney(value)} ฿</div>
                  </div>
                )}
                animate
                motionConfig="gentle"
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default StatisticalInformations;