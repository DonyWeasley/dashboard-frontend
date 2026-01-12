import { useState } from "react";
import {
  Box,
  Typography,
  useTheme,
  Stack,
  TextField,
  MenuItem,
  Paper,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";

// Mock data
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

// Mock summary
const summaryData = {
  total: 12500,
  topCategory: "Travel",
  topBank: "Bank A",
  totalTransactions: 289,
};

// Mock Line data
const lineDataMonth = [
  {
    id: "Expenses",
    color: "hsl(219, 70%, 50%)",
    data: Array.from({ length: 30 }, (_, i) => ({
      x: `${i + 1}`,
      y: Math.floor(Math.random() * 1000),
    })),
  },
];

const lineDataYear = [
  {
    id: "Expenses",
    color: "hsl(219, 70%, 50%)",
    data: Array.from({ length: 12 }, (_, i) => ({
      x: months[i].label,
      y: Math.floor(Math.random() * 10000),
    })),
  },
];

// Mock Pie data
const pieData = [
  {
    id: "SCB",
    label: "Siam Commercial Bank",
    value: 32000,
  },
  {
    id: "KBank",
    label: "Kasikornbank",
    value: 28000,
  },
  {
    id: "BangkokBank",
    label: "Bangkok Bank",
    value: 21000,
  },
  {
    id: "KTB",
    label: "Krungthai Bank",
    value: 18000,
  },
  {
    id: "KTC",
    label: "Krungthai Card",
    value: 15000,
  },
];

// Mock Bar data
const barData = [
  { category: "Travel", amount: 4000 },
  { category: "Food", amount: 3000 },
  { category: "Office", amount: 2500 },
  { category: "Health", amount: 2000 },
  { category: "Other", amount: 1000 },
];

const StatisticalInformations = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState("2026");

  return (
    <Box m="20px">
      <Header title="STATISTICAL INFORMATION" subtitle="Overview of Expenses" />
      {/* Filter Section */}
      <Stack direction="row" spacing={2} mb={3} alignItems="center">
        {/* Filter Type */}
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

        {/* Month */}
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

        {/* Year */}
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
      {/* Summary Section */}
      <Stack
        direction="row"
        spacing={1.5}
        mb={2}
        sx={{
          width: "100%",
          maxWidth: "100%",
          alignItems: "stretch",
        }}
      >
        {/* Total Expenses */}
        <Paper
          sx={{
            flex: 1,
            p: 1.25,
            minHeight: 120,
            bgcolor: colors.primary[400],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "2px" }}
            >
              Total Expenses
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={colors.greenAccent[500]}
              sx={{ lineHeight: 1.1 }}
            >
              {summaryData.total} ฿
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Monthly Spending
            </Typography>
            <Typography
              variant="caption"
              color={colors.redAccent[300]}
              sx={{ display: "block", mt: "2px" }}
            >
              ▲ +8.2% from last month
            </Typography>
          </Box>
        </Paper>

        {/* Top Category */}
        <Paper
          sx={{
            flex: 1,
            p: 1.25,
            minHeight: 120,
            bgcolor: colors.primary[400],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "2px" }}
            >
              Top Category
            </Typography>
            <Typography
              variant="h5"
              fontWeight="bold"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1.1 }}
            >
              {summaryData.topCategory}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Most Spending Category
            </Typography>
            <Typography
              variant="caption"
              color={colors.redAccent[300]}
              sx={{ display: "block", mt: "2px" }}
            >
              ▲ 38% of total expense
            </Typography>
          </Box>
        </Paper>

        {/* Top Bank */}
        <Paper
          sx={{
            flex: 1,
            p: 1.25,
            minHeight: 120,
            bgcolor: colors.primary[400],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "2px" }}
            >
              Top Bank
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1.1 }}
            >
              {summaryData.topBank}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Most Transactions
            </Typography>
            <Typography
              variant="caption"
              color={colors.greenAccent[300]}
              sx={{ display: "block", mt: "2px" }}
            >
              ▼ -5% from last month
            </Typography>
          </Box>
        </Paper>

        {/* Total Transactions */}
        <Paper
          sx={{
            flex: 1,
            p: 1.25,
            minHeight: 120,
            bgcolor: colors.primary[400],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "2px" }}
            >
              Total Transactions
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1.1 }}
            >
              {summaryData.totalTransactions}
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              Transactions This Month
            </Typography>
            <Typography
              variant="caption"
              color={colors.greenAccent[300]}
              sx={{ display: "block", mt: "2px" }}
            >
              ▼ -12% from last month
            </Typography>
          </Box>
        </Paper>
      </Stack>

      {/* Charts Section */}
      <Stack direction="row" spacing={2} mb={2} sx={{ height: "360px" }}>
        {/* Line Chart */}
        <Paper
          sx={{
            flex: 2,
            p: 2,
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography mb={1.5} fontWeight="600">
            Expenses Over Time
          </Typography>

          <ResponsiveLine
            data={filterType === "year" ? lineDataYear : lineDataMonth}
            theme={{
              axis: {
                domain: {
                  line: {
                    stroke: colors.grey[100],
                  },
                },
                ticks: {
                  line: {
                    stroke: colors.grey[100],
                    strokeWidth: 1,
                  },
                  text: {
                    fill: colors.grey[100],
                  },
                },
                legend: {
                  text: {
                    fill: colors.grey[100],
                  },
                },
              },
              tooltip: {
                container: {
                  color: colors.primary[500],
                },
              },
            }}
            margin={{ top: 30, right: 40, bottom: 60, left: 60 }}
            xScale={{ type: "point" }}
            yScale={{
              type: "linear",
              min: 0,
              max: "auto",
            }}
            curve="catmullRom"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickRotation: -45,
              tickPadding: 8,
              tickSize: 0,
            }}
            axisLeft={{
              legend: "Amount (฿)",
              legendPosition: "middle",
              legendOffset: -40,
            }}
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
        <Paper
          sx={{
            flex: 1,
            p: 2,
            bgcolor: colors.primary[400],
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography mb={1.5} fontWeight="600">
            Bank Distribution
          </Typography>

          <ResponsivePie
            data={pieData}
            theme={{
              legends: {
                text: {
                  fill: colors.grey[100],
                },
              },
              tooltip: {
                container: {
                  color: colors.primary[500],
                },
              },
            }}
            margin={{ top: 20, right: 20, bottom: 70, left: 20 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: "set2" }}
            borderWidth={1}
            borderColor={{
              from: "color",
              modifiers: [["darker", 0.2]],
            }}
            /* Labels */
            enableArcLabels={false}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={colors.grey[100]}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            /* Interaction */
            useMesh={true}
            legends={[
              {
                anchor: "bottom",
                direction: "row",
                justify: false,
                translateX: 0,
                translateY: 50,
                itemsSpacing: 10,
                itemWidth: 90,
                itemHeight: 18,
                itemTextColor: colors.grey[100],
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 12,
                symbolShape: "circle",
                effects: [
                  {
                    on: "hover",
                    style: {
                      itemOpacity: 1,
                    },
                  },
                ],
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
        <Typography
          mb={2}
          fontWeight="600"
          variant="h6"
          color={colors.grey[100]}
        >
          Category Expenses
        </Typography>

        <ResponsiveBar
          data={barData}
          layout="horizontal"
          theme={{
            axis: {
              domain: {
                line: {
                  stroke: colors.grey[300],
                },
              },
              ticks: {
                line: {
                  stroke: colors.grey[300],
                },
                text: {
                  fill: colors.grey[200],
                  fontSize: 12,
                },
              },
              legend: {
                text: {
                  fill: colors.grey[200],
                  fontSize: 13,
                },
              },
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
          /* 🎨 สีคนละแท่ง */
          colors={{ scheme: "set2" }}
          colorBy="indexValue"
          borderRadius={8}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.4]],
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            legend: "Amount (฿)",
            legendPosition: "middle",
            legendOffset: 40,
            tickSize: 0,
            tickPadding: 8,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
          }}
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
