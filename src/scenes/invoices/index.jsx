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

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const fmtMoney = (n) =>
  Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token") ||
  "";

const CATEGORY_ORDER = [
  "Food&Drink",
  "Transport",
  "Shopping",
  "Utilities",
  "Others",
];

const monthShort = (m) => months[m - 1]?.label?.slice(0, 3) || String(m);

/** สีประจำธนาคาร */
const BANK_COLORS = {
  BBL: "#002677",
  TTB: "#FFB74D",
  GSB: "#F06292",
  KBank: "#66BB6A",
  SCB: "#AB47BC",
  KTB: "#54c3f7",
  TrueMoney: "#FF8A65",
};

/** Helper: build /stats query */
const buildStatsUrl = ({ range, year, month }) => {
  const params = new URLSearchParams();
  params.set("range", range);

  if (range === "year") {
    params.set("year", String(year));
  }

  if (range === "month") {
    params.set("year", String(year));
    params.set("month", String(Number(month)));
  }

  return `${API_BASE}/stats/?${params.toString()}`;
};

const StatisticalInformations = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [filterType, setFilterType] = useState("all");
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState("2026");

  const [cards, setCards] = useState({
    total_expenses: 0,
    top_category: "Others",
    top_bank: "-",
    total_transactions: 0,
  });

  const [expensesOverTime, setExpensesOverTime] = useState([]);
  const [averageLine, setAverageLine] = useState(null);

  const [categoryByBank, setCategoryByBank] = useState({
    banks: [],
    items: [],
  });
  const [spendingSpread, setSpendingSpread] = useState([]);
  const [bankHeatmap, setBankHeatmap] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const ACCENT = useMemo(
    () => ({
      line: colors.greenAccent[400],
      lineDark: colors.greenAccent[500],
      pointBorder: colors.greenAccent[700],
      goal: colors.greenAccent[200],
      areaOpacity: 0.16,
      bankFallback: colors.greenAccent[400],
    }),
    [colors],
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

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setErr("");

      const token = getToken();
      const url = buildStatsUrl({ range: filterType, year, month });

      try {
        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const text = await res.text();
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
        const data = text ? JSON.parse(text) : {};

        setCards({
          total_expenses: Number(data?.cards?.total_expenses ?? 0),
          top_category: data?.cards?.top_category ?? "Others",
          top_bank: data?.cards?.top_bank ?? "-",
          total_transactions: Number(data?.cards?.total_transactions ?? 0),
        });

        const expensesRaw = Array.isArray(data?.expenses_over_time)
          ? data.expenses_over_time
          : Array.isArray(data?.expenses_over_time?.items)
            ? data.expenses_over_time.items
            : [];

        setExpensesOverTime(expensesRaw);

        setAverageLine(
          data?.average_line === null || data?.average_line === undefined
            ? null
            : Number(data.average_line),
        );

        setCategoryByBank({
          banks: Array.isArray(data?.category_by_bank?.banks)
            ? data.category_by_bank.banks
            : [],
          items: Array.isArray(data?.category_by_bank?.items)
            ? data.category_by_bank.items
            : [],
        });

        setSpendingSpread(
          Array.isArray(data?.spending_spread) ? data.spending_spread : [],
        );
        setBankHeatmap(data?.bank_heatmap || null);
      } catch (e) {
        setErr(e?.message || "Failed to load statistics");
        setCards({
          total_expenses: 0,
          top_category: "Others",
          top_bank: "-",
          total_transactions: 0,
        });
        setExpensesOverTime([]);
        setAverageLine(null);
        setCategoryByBank({ banks: [], items: [] });
        setSpendingSpread([]);
        setBankHeatmap(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [filterType, month, year]);

  const xAxisLabel = useMemo(() => {
    if (filterType === "all") return "Year";
    if (filterType === "year") return "Month";
    return "5-Day Range";
  }, [filterType]);

  const lineData = useMemo(() => {
    const expenseSeries = (expensesOverTime || [])
      .map((p) => {
        const rawX = p?.x;
        const yNum = Number(p?.total);
        if (!Number.isFinite(yNum)) return null;

        let xLabel = "";
        if (filterType === "all") {
          xLabel = String(rawX);
        } else if (filterType === "year") {
          xLabel = monthShort(Number(rawX));
        } else {
          xLabel = String(rawX);
        }

        return { x: xLabel, y: yNum };
      })
      .filter(Boolean);

    return [{ id: "Expenses", data: expenseSeries }];
  }, [expensesOverTime, filterType]);

  const stackedBar = useMemo(() => {
    const banks = Array.isArray(categoryByBank?.banks)
      ? categoryByBank.banks
      : [];
    const items = Array.isArray(categoryByBank?.items)
      ? categoryByBank.items
      : [];

    const map = new Map(items.map((r) => [r?.category, r]));
    const ordered = CATEGORY_ORDER.filter((c) => map.has(c)).map((c) =>
      map.get(c),
    );

    items.forEach((r) => {
      const c = r?.category;
      if (c && !CATEGORY_ORDER.includes(c)) ordered.push(r);
    });

    return { keys: banks, data: ordered };
  }, [categoryByBank]);

  const boxPlotData = useMemo(() => {
    const rows = Array.isArray(spendingSpread) ? spendingSpread : [];

    const points = [];
    rows.forEach((r) => {
      const group = r?.category || "Others";
      const min = Number(r?.min ?? 0);
      const q1 = Number(r?.q1 ?? 0);
      const med = Number(r?.median ?? 0);
      const q3 = Number(r?.q3 ?? 0);
      const max = Number(r?.max ?? 0);

      const vals = [min, q1, q1, med, med, q3, q3, max].filter((v) =>
        Number.isFinite(v),
      );
      vals.forEach((v) => points.push({ group, id: "Amount", value: v }));
    });

    const ordered = [];
    CATEGORY_ORDER.forEach((cat) => {
      points.forEach((p) => {
        if (p.group === cat) ordered.push(p);
      });
    });

    return ordered.length ? ordered : points;
  }, [spendingSpread]);

  const heatmapData = useMemo(() => {
    if (!bankHeatmap) return [];

    const banks = Array.isArray(bankHeatmap?.banks) ? bankHeatmap.banks : [];
    const buckets = Array.isArray(bankHeatmap?.days)
      ? bankHeatmap.days
      : Array.isArray(bankHeatmap?.labels)
        ? bankHeatmap.labels
        : [];

    const matrix = Array.isArray(bankHeatmap?.matrix) ? bankHeatmap.matrix : [];

    return banks.map((b, i) => ({
      id: b,
      data: buckets.map((d, j) => {
        let xLabel = "";
        if (filterType === "all") {
          xLabel = String(d);
        } else if (filterType === "year") {
          xLabel = monthShort(Number(d));
        } else {
          xLabel = String(d);
        }

        return {
          x: xLabel,
          y: Number.isFinite(Number(matrix?.[i]?.[j]))
            ? Number(matrix[i][j])
            : 0,
        };
      }),
    }));
  }, [bankHeatmap, filterType]);

  const heatMax = useMemo(() => {
    const vals = heatmapData.flatMap((r) => r.data.map((d) => d.y));
    const m = Math.max(...vals, 0);
    return m > 0 ? m : 1;
  }, [heatmapData]);

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

  const lineYMax = useMemo(() => {
    const ys = (lineData?.[0]?.data || [])
      .map((d) => Number(d?.y))
      .filter(Number.isFinite);

    const dataMax = ys.length ? Math.max(...ys) : 0;
    const goalMax = Number.isFinite(Number(averageLine))
      ? Number(averageLine)
      : 0;

    return Math.max(dataMax, goalMax, 1);
  }, [lineData, averageLine]);

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Header title="STATISTICAL INFORMATION" subtitle="Overview of Expenses" />

      {err && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
          {err}
        </Alert>
      )}

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
        {[
          {
            title: "Total Expenses",
            value: `${fmtMoney(cards.total_expenses)} ฿`,
            sub: "Total Spending (filtered)",
          },
          {
            title: "Top Category",
            value: cards.top_category || "Others",
            sub: "Highest spending category",
          },
          {
            title: "Top Bank",
            value: cards.top_bank || "-",
            sub: "Highest spending bank",
          },
          {
            title: "Total Transactions",
            value: cards.total_transactions ?? 0,
            sub: "Slips uploaded (filtered)",
          },
        ].map((c) => (
          <Paper
            key={c.title}
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
                {c.title}
              </Typography>
              <Typography
                variant={c.title === "Top Category" ? "h5" : "h4"}
                fontWeight="900"
                color={colors.greenAccent[400]}
                sx={{ lineHeight: 1.1, wordBreak: "break-word" }}
              >
                {c.value}
              </Typography>
              <Typography variant="caption" color={colors.grey[300]}>
                {c.sub}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
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
              X: {xAxisLabel} • Y: Amount (฿)
            </Typography>
          </Stack>

          <Box sx={{ flex: 1, minHeight: 0 }}>
            {!lineData?.[0]?.data?.length ? (
              emptyMsg("No data for line chart")
            ) : (
              <ResponsiveLine
                data={lineData}
                theme={{
                  ...nivoTheme,
                  axis: {
                    ...nivoTheme?.axis,
                    ticks: {
                      text: {
                        fill: "#e5e7eb",
                        fontSize: 12,
                        fontWeight: 600,
                      },
                    },
                    legend: {
                      text: {
                        fill: "#f9fafb",
                        fontSize: 13,
                        fontWeight: 700,
                      },
                    },
                  },
                  grid: {
                    line: {
                      stroke: "rgba(255,255,255,0.08)",
                      strokeWidth: 1,
                    },
                  },
                  crosshair: {
                    line: {
                      stroke: "#86efac",
                      strokeWidth: 1,
                      strokeOpacity: 0.5,
                    },
                  },
                  tooltip: {
                    container: {
                      background: "#111827",
                      color: "#ffffff",
                      fontSize: 12,
                      borderRadius: 8,
                      boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                      padding: "8px 10px",
                    },
                  },
                }}
                margin={{ top: 30, right: 30, bottom: 60, left: 70 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: lineYMax }}
                curve="catmullRom"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  legend: xAxisLabel,
                  legendPosition: "middle",
                  legendOffset: 42,
                  tickRotation: -25,
                  tickPadding: 10,
                  tickSize: 0,
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
                pointSize={8}
                pointColor={ACCENT.point}
                pointBorderWidth={2}
                pointBorderColor={ACCENT.pointBorder}
                enableArea
                areaOpacity={ACCENT.areaOpacity}
                enableGridX={false}
                enableGridY
                useMesh
                markers={
                  filterType === "month" &&
                  Number.isFinite(Number(averageLine)) &&
                  Number(averageLine) > 0
                    ? [
                        {
                          axis: "y",
                          value: Number(averageLine),
                          lineStyle: {
                            stroke: ACCENT.goal,
                            strokeWidth: 3,
                            strokeDasharray: "8 6",
                          },
                          legend: `Goal ${fmtMoney(averageLine)} ฿`,
                          legendPosition: "top-left",
                          textStyle: {
                            fill: ACCENT.goal,
                            fontSize: 12,
                            fontWeight: 800,
                          },
                        },
                      ]
                    : []
                }
                tooltip={({ point }) => (
                  <div>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>
                      {xAxisLabel}: {point.data.xFormatted}
                    </div>
                    <div style={{ color: ACCENT.point }}>
                      Expenses: {fmtMoney(point.data.yFormatted)} ฿
                    </div>
                  </div>
                )}
              />
            )}
          </Box>
        </Paper>

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
                theme={{
                  ...nivoTheme,
                  legends: {
                    text: {
                      fill: "#e5e7eb",
                      fontSize: 12,
                      fontWeight: 700,
                    },
                  },
                }}
                margin={{ top: 78, right: 20, bottom: 55, left: 60 }}
                padding={0.35}
                colors={({ id }) => BANK_COLORS[id] || ACCENT.bankFallback}
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
                enableGridY
                enableGridX={false}
                enableLabel={false}
                legends={[
                  {
                    anchor: "top",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: -56,
                    itemsSpacing: 10,
                    itemWidth: 72,
                    itemHeight: 18,
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 12,
                    symbolShape: "square",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemOpacity: 0.85,
                        },
                      },
                    ],
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
                colors={[colors.greenAccent[300]]}
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
                theme={{
                  ...nivoTheme,
                  labels: {
                    text: {
                      fill: "#111827", // ตัวเลขใน cell เข้มขึ้น
                      fontSize: 12,
                      fontWeight: 700,
                    },
                  },
                  axis: {
                    ...nivoTheme?.axis,
                    ticks: {
                      text: {
                        fill: "#e5e7eb", // สีแกน X/Y
                        fontSize: 12,
                        fontWeight: 600,
                      },
                    },
                    legend: {
                      text: {
                        fill: "#f9fafb", // สีชื่อแกน
                        fontSize: 13,
                        fontWeight: 700,
                      },
                    },
                  },
                  legends: {
                    text: {
                      fill: "#e5e7eb", // สี legend ด้านขวา
                      fontSize: 11,
                    },
                  },
                }}
                margin={{ top: 10, right: 90, bottom: 60, left: 95 }}
                colors={{
                  type: "sequential",
                  scheme: "greens",
                  minValue: 0,
                  maxValue: heatMax,
                }}
                emptyColor="#334155" // ช่องไม่มีค่าให้เข้มขึ้น จะได้ไม่กลืน
                forceSquare={false}
                cellOpacity={1}
                cellBorderWidth={1}
                cellBorderColor="#94a3b8"
                enableLabels={true}
                labelTextColor="#111827" // สำคัญ: อย่าใช้ grey[100] ตรงนี้
                legends={[
                  {
                    anchor: "right",
                    translateX: 60,
                    length: 220,
                    thickness: 12,
                    direction: "column",
                    tickPosition: "after",
                    tickSize: 3,
                    tickSpacing: 6,
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
                  legend: xAxisLabel,
                  legendPosition: "middle",
                  legendOffset: 45,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 10,
                  legend: "Bank",
                  legendPosition: "middle",
                  legendOffset: -70,
                }}
                valueFormat={(v) => (v == null ? "" : Number(v).toFixed(0))}
                tooltip={({ cell }) => (
                  <div
                    style={{
                      background: "#111827",
                      color: "#fff",
                      padding: "8px 10px",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>
                      {cell.serieId} • {cell.xKey}
                    </div>
                    <div>Amount: {fmtMoney(cell.value)} ฿</div>
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
