import { ResponsiveBar } from "@nivo/bar";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";

const ExpenseByCategory = ({ data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 🎨 กำหนดสีให้แต่ละ category
  const categoryColors = {
    Food: "#38bcb2",
    Transport: "#4dabf5",
    Shopping: "#eed312",
    Utilities: "#9c27b0",
    Others: "#f44336",
  };

  if (!data || data.length === 0) return null;

  return (
    <ResponsiveBar
      data={data}
      keys={["amount"]}
      indexBy="category"
      margin={{ top: 20, right: 30, bottom: 40, left: 70 }}
      padding={0.4}

      // ✅ จุดสำคัญ: ทำให้แต่ละแท่งคนละสี
      colors={({ indexValue }) =>
        categoryColors[indexValue] || "#38bcb2"
      }

      theme={{
        axis: {
          domain: { line: { stroke: colors.grey[100] } },
          ticks: {
            line: { stroke: colors.grey[100] },
            text: { fill: colors.grey[100] },
          },
          legend: {
            text: { fill: colors.grey[100] },
          },
        },
        legends: {
          text: { fill: colors.grey[100] },
        },
        tooltip: {
          container: {
            background: colors.primary[400],
            color: colors.grey[100],
            fontSize: 13,
          },
        },
      }}
      axisBottom={{
        legend: "Category",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        legend: "Expense (฿)",
        legendPosition: "middle",
        legendOffset: -50,
      }}
      enableLabel={false}
      role="application"
      tooltip={({ value, indexValue }) => (
        <strong>
          {indexValue}: {value.toLocaleString()} ฿
        </strong>
      )}
    />
  );
};

export default ExpenseByCategory;
