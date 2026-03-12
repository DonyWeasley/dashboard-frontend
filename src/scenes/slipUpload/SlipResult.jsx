import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Chip,
  Stack,
  InputAdornment,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { tokens } from "../../theme";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Autocomplete from "@mui/material/Autocomplete";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const ICON_BASE = `${process.env.PUBLIC_URL}/assets/icons`;

const BANK_OPTIONS = [
  "ธนาคารกรุงเทพ",
  "ธนาคารกสิกรไทย",
  "ธนาคารกรุงไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารทหารไทยธนชาต",
  "ธนาคารออมสิน",
  "TrueMoney Wallet",
];

const CATEGORIES = [
  {
    key: "Food&Drink",
    label: "Food & Drink",
    icon: `${ICON_BASE}/food-drink.png`,
  },
  { key: "Transport", label: "Transport", icon: `${ICON_BASE}/transport.png` },
  { key: "Shopping", label: "Shopping", icon: `${ICON_BASE}/shopping.png` },
  { key: "Utilities", label: "Utilities", icon: `${ICON_BASE}/utilities.png` },
  { key: "Others", label: "Others", icon: `${ICON_BASE}/others.png` },
];

function guessCategoryFromText(text) {
  const t = (text || "").toLowerCase();
  const has = (arr) => arr.some((w) => t.includes(w));

  if (
    has([
      "ค่าข้าว",
      "ข้าว",
      "อาหาร",
      "กาแฟ",
      "ชานม",
      "ขนม",
      "pizza",
      "burger",
      "coffee",
      "tea",
      "food",
      "drink",
      "cafe",
      "restaurant",
    ])
  )
    return "Food&Drink";

  if (
    has([
      "รถ",
      "น้ำมัน",
      "ค่าทางด่วน",
      "ค่ารถ",
      "bts",
      "mrt",
      "grab",
      "bolt",
      "taxi",
      "bus",
      "train",
      "fuel",
      "gas",
      "toll",
    ])
  )
    return "Transport";

  if (
    has([
      "ตลาด",
      "ร้านค้า",
      "เสื้อ",
      "รองเท้า",
      "shopee",
      "lazada",
      "central",
      "lotus",
      "bigc",
      "shopping",
      "mall",
    ])
  )
    return "Shopping";

  if (
    has([
      "ค่าไฟ",
      "ค่าน้ำ",
      "ค่าเน็ต",
      "อินเทอร์เน็ต",
      "ค่าโทร",
      "truemove",
      "ais",
      "dtac",
      "internet",
      "electric",
      "water",
      "bill",
      "utility",
    ])
  )
    return "Utilities";

  return "Others";
}

export default function SlipResult() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { state } = useLocation();
  const navigate = useNavigate();

  const handleCancel = async () => {
    try {
      if (!transactionId) {
        navigate("/slip-upload");
        return;
      }

      if (!token) {
        navigate("/slip-upload");
        return;
      }

      await fetch(`${API_BASE}/transactions/${transactionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/slip-upload");
    } catch (err) {
      navigate("/slip-upload");
    }
  };

  const previewUrl = state?.previewUrl;
  const ocr = state?.ocr;

  const transactionId =
    state?.transaction_id ||
    state?.transactionId ||
    ocr?.transaction_id ||
    ocr?.transactionId ||
    ocr?.transaction_id;

  const token = localStorage.getItem("token") || "";

  const ocrText = useMemo(() => {
    const t1 = ocr?.text || "";
    const t2 = ocr?.rawText || "";
    const t3 = Array.isArray(ocr?.lines) ? ocr.lines.join(" ") : "";
    const t4 = ocr?.memo || "";
    return [t1, t2, t3, t4].filter(Boolean).join(" ").trim();
  }, [ocr]);

  const guessedCategory = useMemo(
    () => guessCategoryFromText(ocrText),
    [ocrText],
  );

  const initial = useMemo(
    () => ({
      bank: ocr?.bank || "",
      date: ocr?.date || "",
      time: ocr?.time || "",
      amount: ocr?.amount || "",
      detectedText: ocrText || "",
      category:
        ocr?.category || ocr?.suggested_category || guessedCategory || "Others",
    }),
    [ocr, ocrText, guessedCategory],
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const [dateVal, setDateVal] = useState(() =>
    initial.date ? dayjs(initial.date, ["YYYY-MM-DD", "DD/MM/YY"]) : null,
  );
  const [timeVal, setTimeVal] = useState(() =>
    initial.time ? dayjs(initial.time, "HH:mm") : null,
  );

  useEffect(() => {
    setForm(initial);
    setDateVal(
      initial.date ? dayjs(initial.date, ["YYYY-MM-DD", "DD/MM/YY"]) : null,
    );
    setTimeVal(initial.time ? dayjs(initial.time, "HH:mm") : null);
  }, [initial]);

  const setField =
    (k) =>
    (e = {}) =>
      setForm((p) => ({ ...p, [k]: e.target?.value ?? "" }));

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const buildTransferredAtISO = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const isoDate = (() => {
      const s = String(dateStr).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
      if (!m) return null;
      const dd = m[1].padStart(2, "0");
      const mm = m[2].padStart(2, "0");
      let yy = m[3];
      if (yy.length === 2) yy = "20" + yy;
      return `${yy}-${mm}-${dd}`;
    })();

    if (!isoDate) return null;

    const tt = String(timeStr).trim();
    if (!/^\d{1,2}:\d{2}$/.test(tt)) return null;

    const hh = tt.split(":")[0].padStart(2, "0");
    const min = tt.split(":")[1];
    return `${isoDate}T${hh}:${min}:00`;
  };

  const handleSave = async () => {
    setSaveErr("");

    try {
      if (!token) throw new Error("No token found. Please login first.");
      if (!transactionId) {
        throw new Error(
          "Missing transaction_id (please upload again so backend returns transaction_id).",
        );
      }

      setSaving(true);

      const transferred_at = buildTransferredAtISO(form.date, form.time);

      const payload = {
        bank: form.bank || null,
        amount: form.amount
          ? Number(String(form.amount).replace(/,/g, ""))
          : null,
        memo: form.detectedText || null,
        category: form.category || "Others",
        transferred_at,
      };

      const res = await fetch(`${API_BASE}/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = text || `HTTP ${res.status}`;
        try {
          const j = JSON.parse(text);
          msg = j?.detail || j?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      alert("Saved ");
      navigate("/transactions");
    } catch (err) {
      setSaveErr(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!previewUrl && !ocr) {
    return (
      <Box p={3}>
        <Typography color={colors.grey[100]}>
          Missing data. Please upload again.
        </Typography>
        <Button onClick={() => navigate("/slip-upload")}>Back</Button>
      </Box>
    );
  }

  const textFieldSx = {
    "& .MuiInputLabel-root": { color: colors.grey[300] },
    "& .MuiInputLabel-root.Mui-focused": { color: colors.greenAccent[300] },
    "& .MuiOutlinedInput-root": {
      color: colors.grey[100],
      backgroundColor: colors.primary[500],
      borderRadius: 2,
      "& fieldset": { borderColor: colors.grey[700] },
      "&:hover fieldset": { borderColor: colors.greenAccent[400] },
      "&.Mui-focused fieldset": { borderColor: colors.greenAccent[400] },
    },
    "& .MuiInputAdornment-root": { color: colors.grey[300] },
  };

  const selectedCategoryObj =
    CATEGORIES.find((x) => x.key === form.category) ||
    CATEGORIES.find((x) => x.key === "Others");

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 4,
          overflow: "hidden",
          backgroundColor: colors.primary[400],
        }}
      >
        <Box textAlign="center">
          <Typography
            variant="h4"
            fontWeight={900}
            color={colors.grey[100]}
            sx={{ fontSize: { xs: 22, sm: 26, md: 30 } }}
          >
            Result
          </Typography>
          <Typography sx={{ color: colors.grey[300], mt: 0.5 }}>
            ตรวจสอบและแก้ไขข้อมูลที่ OCR อ่านได้ จากนั้นเลือกหมวดหมู่ค่าใช้จ่าย
          </Typography>
        </Box>

        <Divider sx={{ my: 3, borderColor: colors.grey[700] }} />

        {saveErr && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveErr}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(280px, 360px) 1fr",
              lg: "minmax(280px, 360px) 1fr minmax(260px, 320px)",
            },
            gap: { xs: 2, md: 3 },
            alignItems: "start",
          }}
        >
          {/* LEFT: Preview */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 2,
              backgroundColor: colors.primary[500],
              border: `1px solid ${colors.grey[700]}`,
            }}
          >
            <Typography fontWeight={800} mb={1} color={colors.grey[100]}>
              Slip Preview
            </Typography>

            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: `1px solid ${colors.grey[700]}`,
                backgroundColor: colors.primary[600],
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt="slip"
                sx={{
                  width: "100%",
                  display: "block",
                  objectFit: "contain",
                  maxHeight: { xs: 360, sm: 420, md: 520 },
                }}
              />
            </Box>

            <Typography sx={{ color: colors.grey[300], mt: 1, fontSize: 13 }}>
              * ถ้ารูปไม่ชัด OCR อาจอ่านผิด (สามารถแก้ไขได้ในฟอร์ม)
            </Typography>

            <Typography sx={{ color: colors.grey[500], mt: 1, fontSize: 12 }}>
              tx_id: {transactionId || "-"}
            </Typography>
          </Paper>

          {/* MIDDLE: Form */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              backgroundColor: colors.primary[500],
              border: `1px solid ${colors.grey[700]}`,
              minWidth: 0,
            }}
          >
            <Typography fontWeight={900} mb={1} color={colors.grey[100]}>
              Extracted Data (Editable)
            </Typography>

            <Typography sx={{ color: colors.grey[300], mb: 2, fontSize: 13 }}>
              ระบบเดาหมวดหมู่จากคำที่เจอบนสลิปได้ (แก้ไขได้)
            </Typography>

            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 3,
                border: `1px solid ${colors.grey[700]}`,
                backgroundColor: colors.primary[600],
              }}
            >
              <Typography color={colors.grey[100]} fontWeight={800}>
                Auto Category:{" "}
                <span style={{ color: colors.greenAccent[300] }}>
                  <img
                    src={selectedCategoryObj?.icon}
                    alt={selectedCategoryObj?.label}
                    style={{
                      width: 18,
                      height: 18,
                      verticalAlign: "middle",
                      marginRight: 6,
                    }}
                  />
                  {selectedCategoryObj?.label}
                </span>
              </Typography>
              <Typography
                sx={{ color: colors.grey[300], fontSize: 12, mt: 0.5 }}
              >
                * ถ้าเดาผิด ให้เลือกหมวดหมู่ใหม่ (ด้านล่าง/ด้านขวา) ได้เลย
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Autocomplete
                options={BANK_OPTIONS}
                value={form.bank || null}
                onChange={(_, newValue) => {
                  setForm((p) => ({ ...p, bank: newValue || "" }));
                }}
                inputValue={form.bank || ""}
                onInputChange={(_, newInputValue) => {
                  // ✅ ให้พิมพ์ได้ด้วย (กรณี bank ไม่อยู่ใน list)
                  setForm((p) => ({ ...p, bank: newInputValue || "" }));
                }}
                freeSolo
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Bank"
                    placeholder="เลือกธนาคาร หรือพิมพ์เอง"
                    sx={textFieldSx}
                  />
                )}
              />

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <DatePicker
                    label="Date"
                    value={dateVal}
                    onChange={(v) => {
                      setDateVal(v);
                      setForm((p) => ({
                        ...p,
                        date: v ? v.format("YYYY-MM-DD") : "",
                      }));
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: textFieldSx,
                      },
                    }}
                  />

                  <TimePicker
                    label="Time"
                    value={timeVal}
                    onChange={(v) => {
                      setTimeVal(v);
                      setForm((p) => ({
                        ...p,
                        time: v ? v.format("HH:mm") : "",
                      }));
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        sx: textFieldSx,
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>

              <TextField
                label="Amount"
                value={form.amount}
                onChange={setField("amount")}
                fullWidth
                inputMode="decimal"
                sx={textFieldSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">Baht</InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Detected Items (OCR)"
                value={form.detectedText}
                onChange={setField("detectedText")}
                fullWidth
                multiline
                minRows={3}
                placeholder='เช่น "ค่าข้าว", "กาแฟ", "Grab"...'
                sx={textFieldSx}
              />
            </Stack>

            <Divider sx={{ my: 2.5, borderColor: colors.grey[700] }} />

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  color: colors.greenAccent[300],
                  borderColor: colors.greenAccent[300],
                  "&:hover": {
                    borderColor: colors.greenAccent[400],
                    backgroundColor: colors.primary[700],
                  },
                }}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  fontWeight: 800,
                  "&:hover": { backgroundColor: colors.greenAccent[700] },
                }}
                disabled={saving}
              >
                {saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Save"
                )}
              </Button>
            </Box>
          </Paper>

          {/* RIGHT: Category (Desktop sticky) */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 2.5,
              backgroundColor: colors.primary[500],
              border: `2px solid ${colors.grey[700]}`,
              position: { lg: "sticky" },
              top: { lg: 16 },
              height: "fit-content",
              display: { xs: "none", lg: "block" },
            }}
          >
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                mb: 2,
                border: `1px solid ${colors.grey[700]}`,
                backgroundColor: colors.primary[600],
              }}
            >
              <Typography
                variant="h5"
                fontWeight={1000}
                color={colors.grey[100]}
              >
                Category
              </Typography>
              <Typography
                sx={{ color: colors.grey[300], mt: 0.5, fontSize: 13 }}
              >
                ถ้า OCR เดาผิด ให้เลือกใหม่ได้เลย
              </Typography>
            </Box>

            <Box display="grid" gap={1.2}>
              {CATEGORIES.map((c) => {
                const active = form.category === c.key;
                return (
                  <Chip
                    key={c.key}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          component="img"
                          src={c.icon}
                          alt={c.label}
                          sx={{ width: 18, height: 18 }}
                        />
                        <Box>{c.label}</Box>
                      </Box>
                    }
                    clickable
                    onClick={() => setForm((p) => ({ ...p, category: c.key }))}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      py: 2.2,
                      px: 1.2,
                      borderRadius: 3,
                      fontSize: 15,
                      fontWeight: active ? 900 : 700,
                      color: colors.grey[100],
                      backgroundColor: active
                        ? colors.primary[600]
                        : colors.primary[500],
                      border: active
                        ? `2px solid ${colors.greenAccent[400]}`
                        : `1px solid ${colors.grey[700]}`,
                      boxShadow: active
                        ? "0 10px 24px rgba(0,0,0,0.25)"
                        : "none",
                      transform: active ? "scale(1.02)" : "scale(1)",
                      transition: "0.15s",
                      "&:hover": {
                        backgroundColor: colors.primary[600],
                        transform: active ? "scale(1.02)" : "scale(1.01)",
                      },
                    }}
                  />
                );
              })}
            </Box>

            <Divider sx={{ my: 2, borderColor: colors.grey[700] }} />

            <Typography sx={{ color: colors.grey[300], fontSize: 13 }}>
              Selected:{" "}
              <b style={{ color: colors.grey[100] }}>
                <img
                  src={selectedCategoryObj?.icon}
                  alt={selectedCategoryObj?.label}
                  style={{
                    width: 16,
                    height: 16,
                    verticalAlign: "middle",
                    marginRight: 6,
                  }}
                />
                {selectedCategoryObj?.label}
              </b>
            </Typography>
          </Paper>

          {/* Category (Mobile/Tablet) */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 2.5,
              backgroundColor: colors.primary[500],
              border: `2px solid ${colors.grey[700]}`,
              display: { xs: "block", lg: "none" },
            }}
          >
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                mb: 2,
                border: `1px solid ${colors.grey[700]}`,
                backgroundColor: colors.primary[600],
              }}
            >
              <Typography
                variant="h5"
                fontWeight={1000}
                color={colors.grey[100]}
              >
                Category
              </Typography>
              <Typography
                sx={{ color: colors.grey[300], mt: 0.5, fontSize: 13 }}
              >
                ถ้า OCR เดาผิด ให้เลือกใหม่ได้เลย
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.2,
              }}
            >
              {CATEGORIES.map((c) => {
                const active = form.category === c.key;
                return (
                  <Chip
                    key={c.key}
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          component="img"
                          src={c.icon}
                          alt={c.label}
                          sx={{ width: 18, height: 18 }}
                        />
                        <Box>{c.label}</Box>
                      </Box>
                    }
                    clickable
                    onClick={() => setForm((p) => ({ ...p, category: c.key }))}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      py: 2,
                      px: 1.2,
                      borderRadius: 3,
                      fontSize: 14,
                      fontWeight: active ? 900 : 700,
                      color: colors.grey[100],
                      backgroundColor: active
                        ? colors.primary[600]
                        : colors.primary[500],
                      border: active
                        ? `2px solid ${colors.greenAccent[400]}`
                        : `1px solid ${colors.grey[700]}`,
                      transition: "0.15s",
                      "&:hover": { backgroundColor: colors.primary[600] },
                    }}
                  />
                );
              })}
            </Box>

            <Divider sx={{ my: 2, borderColor: colors.grey[700] }} />

            <Typography sx={{ color: colors.grey[300], fontSize: 13 }}>
              Selected:{" "}
              <b style={{ color: colors.grey[100] }}>
                <img
                  src={selectedCategoryObj?.icon}
                  alt={selectedCategoryObj?.label}
                  style={{
                    width: 16,
                    height: 16,
                    verticalAlign: "middle",
                    marginRight: 6,
                  }}
                />
                {selectedCategoryObj?.label}
              </b>
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
