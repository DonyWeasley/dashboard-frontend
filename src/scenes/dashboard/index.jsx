import {
  Box,
  Typography,
  useTheme,
  Button,
  ButtonGroup,
} from "@mui/material";
import { useState } from "react"; // ต้อง import useState
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockTransactions";
import Header from "../../components/Header";
import ExpenseByCategory from "../bar/ExpenseByCategory";
import { expenseData } from "../../data/expenseData";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [range, setRange] = useState("month");

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box textAlign="center">
            {/* TOP */}
            <Typography
              variant="h5"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "6px" }}
            >
              Average per Day
            </Typography>

            {/* MAIN NUMBER */}
            <Typography
              variant="h1"
              fontWeight="bold"
              color={colors.greenAccent[500]}
              sx={{ lineHeight: 1 }}
            >
              415 ฿
            </Typography>

            {/* BOTTOM */}
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ mt: "4px" }}
            >
              Daily Spending
            </Typography>

            {/* TREND */}
            <Typography
              variant="subtitle1"
              color={colors.greenAccent[400]}
              sx={{ mt: "6px" }}
            >
              ▼ -5% from yesterday
            </Typography>
          </Box>
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box textAlign="center">
            {/* TOP */}
            <Typography
              variant="h5"
              color={colors.grey[200]}
              fontWeight="600"
              sx={{ mb: "6px" }}
            >
              Total Monthly Expense
            </Typography>

            {/* MAIN NUMBER */}
            <Typography
              variant="h1"
              fontWeight="bold"
              color={colors.greenAccent[400]}
              sx={{ lineHeight: 1 }}
            >
              22,450 ฿
            </Typography>

            {/* BOTTOM */}
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ mt: "4px" }}
            >
              Monthly Spending
            </Typography>

            {/* TREND */}
            <Typography
              variant="subtitle1"
              color={colors.redAccent[300]}
              sx={{ mt: "6px" }}
            >
              ▲ +8.2% from last month
            </Typography>
          </Box>
        </Box>

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
              289
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
              color={colors.greenAccent[300]}
              sx={{ mt: "6px" }}
            >
              ▼ -12% from last month
            </Typography>
          </Box>
        </Box>

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
              Food
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
              color={colors.redAccent[300]}
              sx={{ mt: "6px" }}
            >
              ▲ 38% of total expense
            </Typography>
          </Box>
        </Box>

        {/* ROW 2 */}
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

            <Box display="flex" alignItems="center" gap="10px">
              <ButtonGroup
                size="small"
                variant="outlined"
                sx={{
                  borderColor: colors.greenAccent[500],
                  "& .MuiButton-root": {
                    color: colors.greenAccent[400],
                    borderColor: colors.greenAccent[500],
                    textTransform: "none",
                    fontWeight: 600,
                  },
                  "& .MuiButton-root:hover": {
                    backgroundColor: colors.greenAccent[700],
                    color: colors.primary[900],
                  },
                }}
              >
                <Button onClick={() => setRange("today")}>Today</Button>
                <Button onClick={() => setRange("month")}>This Month</Button>
                <Button onClick={() => setRange("year")}>This Year</Button>
              </ButtonGroup>
            </Box>
          </Box>

          {/* แท่งกราฟ */}
          <Box height="260px">
            <ExpenseByCategory data={expenseData[range]} />
          </Box>
        </Box>

        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          {/* Header */}
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

          {/* List */}
          {mockTransactions.map((transaction, i) => (
            <Box
              key={`${transaction.txId}-${i}`}
              display="flex"
              alignItems="flex-start"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              {/* ซ้าย: หมวดหมู่ + ธนาคาร */}
              <Box sx={{ width: "50%" }}>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {transaction.txId}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.user}
                </Typography>
              </Box>

              {/* กลาง: วันที่จ่าย */}
              <Box
                sx={{ width: "25%", textAlign: "center" }}
                color={colors.grey[100]}
              >
                {transaction.date}
              </Box>

              {/* ขวา: จำนวนเงิน (บาท) */}
              {/* ขวา: จำนวนเงิน (บาท) */}
              <Box
                sx={{
                  width: "25%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Box
                  sx={{
                    width: "70px", 
                    textAlign: "center", 
                    backgroundColor: colors.greenAccent[500],
                    p: "5px 10px",
                    borderRadius: "4px",
                    fontWeight: 600,
                  }}
                >
                  {transaction.cost}฿
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
