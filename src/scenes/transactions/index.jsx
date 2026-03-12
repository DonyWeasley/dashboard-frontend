import {
  Box,
  Typography,
  useTheme,
  IconButton,
  TextField,
  MenuItem,
  Stack,
  Alert,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  Paper,
  Chip,
  InputAdornment,
} from "@mui/material";
import {
  DataGrid,
  GridToolbar,
  getGridSingleSelectOperators,
} from "@mui/x-data-grid";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useCallback, useEffect, useMemo, useState } from "react";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

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

const BANK_OPTIONS = [
  "ธนาคารกรุงเทพ",
  "ธนาคารกสิกรไทย",
  "ธนาคารกรุงไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารทหารไทยธนชาต",
  "ธนาคารออมสิน",
  "TrueMoney Wallet",
];

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatAmount = (value) => Number(value ?? 0).toLocaleString("th-TH");

const Transactions = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedBank, setSelectedBank] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [month, setMonth] = useState("01");
  const [year, setYear] = useState("2026");
  const [day, setDay] = useState(todayISO());

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterModel, setFilterModel] = useState({
  items: [],
});
  const [err, setErr] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = useMemo(
    () =>
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token"),
    [],
  );

  const toAbsUrl = useCallback((p) => {
    if (!p) return "";
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    if (p.startsWith("/")) return `${API_BASE}${p}`;
    return `${API_BASE}/${p}`;
  }, []);

  const handleDeleteRow = useCallback(
    async (row) => {
      const ok = window.confirm(
        "ต้องการลบรายการนี้ใช่ไหม?\n(รูปสลิปจะถูกลบออกจาก uploads ด้วย)",
      );
      if (!ok) return;

      try {
        setDeletingId(row.id);
        setErr("");

        const res = await fetch(`${API_BASE}/transactions/${row.id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        setRows((prev) => prev.filter((x) => x.id !== row.id));
      } catch (e) {
        setErr(e?.message || "Delete failed");
      } finally {
        setDeletingId(null);
      }
    },
    [token],
  );

  const handleDownload = useCallback(() => {
    if (!rows.length) {
      alert("No data to download");
      return;
    }

    const esc = (v) => {
      const s = String(v ?? "");
      if (s.includes('"') || s.includes(",") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const header = ["Date", "Time", "Amount", "Bank", "Category", "SlipURL"];
    const lines = [
      header.join(","),
      ...rows.map((r) =>
        [
          esc(r.date),
          esc(r.time),
          esc(r.amount ?? 0),
          esc(r.bank ?? ""),
          esc(r.category ?? ""),
          esc(r.qr ?? ""),
        ].join(","),
      ),
    ];

    const csv = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const fileName =
      filterType === "day"
        ? `transactions_${day}.csv`
        : filterType === "month"
          ? `transactions_${year}-${month}.csv`
          : filterType === "year"
            ? `transactions_${year}.csv`
            : `transactions_all.csv`;

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [rows, filterType, year, month, day]);

  const summary = useMemo(() => {
    const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount ?? 0), 0);
    const banks = new Set(rows.map((r) => r.bank).filter(Boolean));
    return {
      count: rows.length,
      totalAmount,
      banks: banks.size,
    };
  }, [rows]);

  const columns = useMemo(() => {
    const base = [
      {
        field: "date",
        headerName: "Date",
        flex: 1,
        minWidth: 130,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={0.75}>
            <CalendarMonthOutlinedIcon
              sx={{ fontSize: 16, color: colors.grey[400] }}
            />
            <Typography color={colors.grey[100]} fontWeight={600}>
              {params.value || "-"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "time",
        headerName: "Time",
        flex: 0.9,
        minWidth: 110,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={0.75}>
            <AccessTimeOutlinedIcon
              sx={{ fontSize: 16, color: colors.grey[400] }}
            />
            <Typography color={colors.grey[100]} fontWeight={600}>
              {params.value || "-"}
            </Typography>
          </Box>
        ),
      },
      {
        field: "amount",
        headerName: "Amount (฿)",
        type: "number",
        flex: 1.15,
        minWidth: 150,
        align: "right",
        headerAlign: "right",
        renderCell: (params) => (
          <Typography
            color={colors.greenAccent[300]}
            fontWeight={800}
            sx={{
              width: "100%",
              textAlign: "right",
              pr: 1,
              letterSpacing: 0.2,
            }}
          >
            {formatAmount(params.value)}
          </Typography>
        ),
      },
      {
  field: "bank",
  headerName: "Bank",
  type: "singleSelect",
  valueOptions: BANK_OPTIONS,
  filterOperators: getGridSingleSelectOperators().filter(
    (operator) => operator.value === "is"
  ),
  flex: 1.4,
  minWidth: 210,
  renderCell: (params) => (
    <Box display="flex" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
      <AccountBalanceOutlinedIcon
        sx={{ fontSize: 16, color: colors.blueAccent[200], flexShrink: 0 }}
      />
      <Typography color={colors.grey[100]} fontWeight={600} noWrap>
        {params.value || "-"}
      </Typography>
    </Box>
  ),
},
      {
  field: "category",
  headerName: "Category",
  type: "singleSelect",
  valueOptions: [
    "Food&Drink",
    "Transport",
    "Shopping",
    "Utilities",
    "Others",
  ],
  filterOperators: getGridSingleSelectOperators().filter(
    (operator) => operator.value === "is"
  ),
  flex: 1,
  minWidth: 160,
  renderCell: (params) => (
    <Chip
      label={params.value || "Others"}
      size="small"
      sx={{
        fontWeight: 700,
        backgroundColor: colors.primary[500],
        color: colors.grey[100],
        border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
      }}
    />
  ),
},
      {
        field: "qr",
        headerName: "Slip",
        flex: 0.8,
        minWidth: 120,
        sortable: false,
        renderCell: (params) =>
          params.value ? (
            <a
              href={params.value}
              target="_blank"
              rel="noreferrer"
              style={{
                color: colors.greenAccent[400],
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View
            </a>
          ) : (
            <Typography color={colors.grey[400]}>-</Typography>
          ),
      },
    ];

    if (!editMode) return base;

    return [
      ...base,
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        align: "right",
        headerAlign: "right",
        minWidth: 120,
        flex: 0.8,
        renderCell: (params) => {
          const row = params.row;
          const isDeleting = deletingId === row.id;

          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              
              <Tooltip title="Delete">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRow(row)}
                    disabled={isDeleting}
                    sx={{
                      color: colors.redAccent[300],
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                    }}
                  >
                    {isDeleting ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <DeleteRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, [colors, editMode, deletingId, handleDeleteRow]);

  const columnVisibilityModel = useMemo(() => {
    if (!isMobile) return {};
    return {
      category: false,
    };
  }, [isMobile]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("range", filterType);

    if (filterType === "day") {
      params.set("date", day);
    }

    if (filterType === "month") {
      params.set("year", year);
      params.set("month", String(parseInt(month, 10)));
    }

    if (filterType === "year") {
      params.set("year", year);
    }

    if (selectedBank.trim()) {
      params.set("bank", selectedBank.trim());
    }

    params.set("page", "1");
    params.set("page_size", "100");

    return params.toString();
  }, [filterType, year, month, day, selectedBank]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/transactions/?${queryString}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }

        const data = await res.json();

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
  }, [queryString, token, toAbsUrl]);

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Header title="TRANSACTIONS" subtitle="All expense transaction records" />

      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: { xs: 2, sm: 2.5, md: 3 },
          backgroundColor: colors.primary[400],
          borderRadius: "18px",
          border: `1px solid ${colors.primary[500]}`,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            mb: 3,
            borderRadius: "16px",
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[400]} 100%)`,
            border: `1px solid ${colors.primary[500]}`,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  color: colors.grey[100],
                  fontWeight: 800,
                  fontSize: { xs: 22, md: 26 },
                }}
              >
                Transaction Records
              </Typography>
              <Typography
                sx={{
                  color: colors.grey[300],
                  mt: 0.75,
                  fontSize: 13,
                }}
              >
                ค้นหาและจัดการรายการค่าใช้จ่ายของคุณตามช่วงเวลาและธนาคาร
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={`${summary.count} รายการ`}
                sx={{
                  fontWeight: 700,
                  backgroundColor: colors.primary[400],
                  color: colors.grey[100],
                  border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                }}
              />
              <Chip
                label={`฿${formatAmount(summary.totalAmount)}`}
                sx={{
                  fontWeight: 700,
                  backgroundColor: colors.primary[400],
                  color: colors.greenAccent[300],
                  border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                }}
              />
              <Chip
                label={`${summary.banks} ธนาคาร`}
                sx={{
                  fontWeight: 700,
                  backgroundColor: colors.primary[400],
                  color: colors.blueAccent[200],
                  border: `1px solid ${colors.primary[600] || colors.grey[700]}`,
                }}
              />
            </Stack>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          mb={3}
          alignItems={{ xs: "stretch", md: "flex-end" }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ flex: 1, minWidth: 0, flexWrap: "wrap" }}
            useFlexGap
          >
            <TextField
              select
              size="small"
              label="ธนาคาร"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: colors.primary[500],
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.grey[400], fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">ทั้งหมด</MenuItem>
              {BANK_OPTIONS.map((bank) => (
                <MenuItem key={bank} value={bank}>
                  {bank}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="Filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 160 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: colors.primary[500],
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterAltOutlinedIcon
                      sx={{ color: colors.grey[400], fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="day">By Day</MenuItem>
              <MenuItem value="month">By Month</MenuItem>
              <MenuItem value="year">By Year</MenuItem>
            </TextField>

            {filterType === "day" && (
              <TextField
                size="small"
                label="Date"
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 200 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: colors.primary[500],
                  },
                }}
                InputLabelProps={{ shrink: true }}
              />
            )}

            {(filterType === "month" || filterType === "year") && (
              <TextField
                select
                size="small"
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 140 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: colors.primary[500],
                  },
                }}
              >
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2026">2026</MenuItem>
              </TextField>
            )}

            {filterType === "month" && (
              <TextField
                select
                size="small"
                label="Month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                sx={{
                  width: { xs: "100%", sm: 220 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: colors.primary[500],
                  },
                }}
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>

          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 1,
            }}
          >
            <Tooltip title={editMode ? "Exit edit mode" : "Edit mode"}>
              <IconButton
                onClick={() => setEditMode((v) => !v)}
                sx={{
                  backgroundColor: editMode
                    ? colors.redAccent[400]
                    : colors.blueAccent[600],
                  color: colors.grey[100],
                  borderRadius: "10px",
                  width: 42,
                  height: 42,
                  "&:hover": {
                    backgroundColor: editMode
                      ? colors.redAccent[500]
                      : colors.blueAccent[700],
                  },
                }}
              >
                {editMode ? <CloseRoundedIcon /> : <EditRoundedIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Download CSV">
              <IconButton
                onClick={handleDownload}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  borderRadius: "10px",
                  width: 42,
                  height: 42,
                  "&:hover": { backgroundColor: colors.greenAccent[700] },
                }}
              >
                <DownloadOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>

        {err && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
            {err}
          </Alert>
        )}

        <Box
          sx={{
            height: { xs: "72vh", md: "70vh" },
            overflowX: "auto",
            borderRadius: "16px",
            border: `1px solid ${colors.primary[500]}`,
            overflow: "hidden",
            "& .MuiDataGrid-root": {
              border: "none",
              minWidth: isMobile ? 860 : "100%",
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${colors.primary[500]}`,
              py: 0.75,
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 800,
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "rgba(255,255,255,0.03)",
            },
            "& .MuiDataGrid-footerContainer": {
              backgroundColor: colors.blueAccent[700],
              borderTop: "none",
            },
            "& .MuiDataGrid-toolbarContainer": {
              p: 1,
              borderBottom: `1px solid ${colors.primary[500]}`,
              backgroundColor: colors.primary[500],
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
         <DataGrid
  rows={rows}
  columns={columns}
  slots={{ toolbar: GridToolbar }}
  loading={loading}
  disableRowSelectionOnClick
  columnVisibilityModel={columnVisibilityModel}
 filterModel={filterModel}
onFilterModelChange={(model) => {
  const fixedItems = (model.items || []).map((item) => {
    if (
      (item.field === "category" || item.field === "bank") &&
      item.operator === "contains"
    ) {
      return { ...item, operator: "is" };
    }
    return item;
  });

  setFilterModel({
    ...model,
    items: fixedItems,
  });
}}
  initialState={{
    pagination: { paginationModel: { pageSize: 25, page: 0 } },
  }}
  pageSizeOptions={[10, 25, 50, 100]}
/>
        </Box>
      </Paper>
    </Box>
  );
};

export default Transactions;