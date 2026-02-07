import {
  Box,
  Typography,
  useTheme,
  IconButton,
  TextField,
  MenuItem,
  Stack,
  Alert,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useEffect, useMemo, useState } from "react";

/* -------- MONTH OPTIONS -------- */
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

const Transactions = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [searchBank, setSearchBank] = useState("");
  const [filterType, setFilterType] = useState("all"); 
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState("2026");


  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /* -------- COLUMNS -------- */
  const columns = [
    {
      field: "qr",
      headerName: "QR Reference",
      flex: 1,
      renderCell: (params) => (
        <a
          href={params.value}
          target="_blank"
          rel="noreferrer"
          style={{ color: colors.greenAccent[400] }}
        >
          View Slip
        </a>
      ),
    },
    { field: "bank", headerName: "Bank", flex: 1 },
    {
      field: "amount",
      headerName: "Amount (฿)",
      flex: 1,
      renderCell: (params) => (
        <Typography color={colors.greenAccent[300]}>
          {(params.value ?? 0).toLocaleString()}
        </Typography>
      ),
    },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "time", headerName: "Time", flex: 0.8 },
    { field: "category", headerName: "Category", flex: 1 },
  ];

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("range", filterType);

    if (filterType === "month") {
      params.set("year", year);
      params.set("month", String(parseInt(month, 10))); 
    }
    if (filterType === "year") {
      params.set("year", year);
    }
    if (searchBank.trim()) {
      params.set("bank", searchBank.trim());
    }

  
    params.set("page", "1");
    params.set("page_size", "100"); 

    return params.toString();
  }, [filterType, year, month, searchBank]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr("");
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        const res = await fetch(`${API_BASE}/transactions/?${queryString}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();

        const toAbsUrl = (p) => {
        if (!p) return "";
        if (p.startsWith("http://") || p.startsWith("https://")) return p;
        if (p.startsWith("/")) return `${API_BASE}${p}`;
        return `${API_BASE}/${p}`;
      };



        const mapped = (data.rows || []).map((x) => ({
          id: x.id, 
          qr: toAbsUrl(x.qr),
          bank: x.bank || "-",
          amount: x.amount ?? 0,
          date: x.date || "-",
          time: x.time || "-",
          category: x.category || "Others",
        }));

        setRows(mapped);
      } catch (e) {
        setErr(e?.message || "Failed to load transactions");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [queryString]);

  return (
    <Box m="20px" display="flex" flexDirection="column" height="100%">
      <Header title="TRANSACTIONS" subtitle="All expense transaction records" />

      {/* -------- FILTER BAR -------- */}
      <Stack
        direction="row"
        spacing={2}
        mb={3}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2}>
          {/* Search */}
          <TextField
            placeholder="Search Bank"
            size="small"
            value={searchBank}
            onChange={(e) => setSearchBank(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

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
        </Stack>

        {/* Download */}
        <IconButton
          sx={{
            backgroundColor: colors.greenAccent[600],
            color: colors.grey[100],
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: colors.greenAccent[700],
            },
          }}
        >
          <DownloadOutlinedIcon />
        </IconButton>
      </Stack>

      {/* ✅ Loading / Error */}
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}

      {/* -------- TABLE -------- */}
      <Box
        sx={{
          height: "70vh",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: colors.blueAccent[700],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          loading={loading}
        />
      </Box>
    </Box>
  );
};

export default Transactions;
