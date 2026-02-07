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


const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const CATEGORIES = [
  { key: "Food&Drink", label: "Food & Drink", emoji: "🍜" },
  { key: "Transport", label: "Transport", emoji: "🚌" },
  { key: "Shopping", label: "Shopping", emoji: "🛍️" },
  { key: "Utilities", label: "Utilities", emoji: "💡" },
  { key: "Others", label: "Others", emoji: "📦" },
];

// ✅ keyword-based category guess (ปรับเพิ่มคำได้เรื่อยๆ)
function guessCategoryFromText(text) {
  const t = (text || "").toLowerCase();
  const has = (arr) => arr.some((w) => t.includes(w));

  if (has(["ค่าข้าว", "ข้าว", "อาหาร", "กาแฟ", "ชานม", "ขนม", "pizza", "burger", "coffee", "tea", "food", "drink", "cafe", "restaurant"]))
    return "Food&Drink";

  if (has(["รถ", "น้ำมัน", "ค่าทางด่วน", "ค่ารถ", "bts", "mrt", "grab", "bolt", "taxi", "bus", "train", "fuel", "gas", "toll"]))
    return "Transport";

  if (has(["ตลาด", "ร้านค้า", "เสื้อ", "รองเท้า", "shopee", "lazada", "central", "lotus", "bigc", "shopping", "mall"]))
    return "Shopping";

  if (has(["ค่าไฟ", "ค่าน้ำ", "ค่าเน็ต", "อินเทอร์เน็ต", "ค่าโทร", "truemove", "ais", "dtac", "internet", "electric", "water", "bill", "utility"]))
    return "Utilities";

  return "Others";
}

export default function SlipResult() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { state } = useLocation();
  const navigate = useNavigate();

  const previewUrl = state?.previewUrl;
  const ocr = state?.ocr;

  // ✅ ต้องมี transaction_id เพื่อ PATCH
  // รองรับหลายชื่อ เผื่อส่งมาคนละแบบ
  const transactionId =
    state?.transaction_id ||
    state?.transactionId ||
    ocr?.transaction_id ||
    ocr?.transactionId ||
    ocr?.transaction_id;

  // ✅ token จาก login (คุณเก็บไว้ใน localStorage ก็อ่านจากนี่)
  const token = localStorage.getItem("token") || "";

  // ✅ รวมข้อความ OCR ที่อาจมีหลาย field (ปรับได้ตาม backend จริงทีหลัง)
  const ocrText = useMemo(() => {
    const t1 = ocr?.text || "";
    const t2 = ocr?.rawText || "";
    const t3 = Array.isArray(ocr?.lines) ? ocr.lines.join(" ") : "";
    const t4 = ocr?.memo || ""; // ✅ เผื่อ backend ส่ง memo มา
    return [t1, t2, t3, t4].filter(Boolean).join(" ").trim();
  }, [ocr]);

  const guessedCategory = useMemo(() => guessCategoryFromText(ocrText), [ocrText]);

  const initial = useMemo(
    () => ({
      bank: ocr?.bank || "",
      date: ocr?.date || "",
      time: ocr?.time || "",
      amount: ocr?.amount || "",
      detectedText: ocrText || "",
      // ✅ ถ้า backend ส่ง suggested_category / category มาก่อน ให้ใช้ก่อน
      category:
        ocr?.category ||
        ocr?.suggested_category ||
        guessedCategory ||
        "Others",
    }),
    [ocr, ocrText, guessedCategory]
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const [dateVal, setDateVal] = useState(() =>
  form.date ? dayjs(form.date, ["YYYY-MM-DD", "DD/MM/YY"]) : null
  );
  const [timeVal, setTimeVal] = useState(() =>
    form.time ? dayjs(form.time, "HH:mm") : null
  );

  useEffect(() => {
    setForm(initial);
      setDateVal(initial.date ? dayjs(initial.date, ["YYYY-MM-DD", "DD/MM/YY"]) : null);
       setTimeVal(initial.time ? dayjs(initial.time, "HH:mm") : null);
  },[initial]);

  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
  return () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);


  // ✅ helper: รวม date+time เป็น ISO (ถ้า backend รับ transferred_at)
  const buildTransferredAtISO = (dateStr, timeStr) => {
    // ถ้า date เป็น "2026-01-11" และ time "11:22" -> "2026-01-11T11:22:00"
    if (!dateStr || !timeStr) return null;

    // รองรับกรณี user ใส่ DD/MM/YY (ตาม label) ด้วย
    const isoDate = (() => {
      const s = String(dateStr).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
      if (!m) return null;
      let dd = m[1].padStart(2, "0");
      let mm = m[2].padStart(2, "0");
      let yy = m[3];
      if (yy.length === 2) yy = "20" + yy; // กันง่าย ๆ
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
      if (!token) {
        throw new Error("No token found. Please login first.");
      }

      // ✅ ถ้าไม่มี transactionId แปลว่ายังไม่ได้สร้าง transaction ฝั่ง backend มาก่อน
      // วิธีที่ดีที่สุด: ให้ /upload return transaction_id แล้วส่งมาที่หน้านี้
      if (!transactionId) {
        throw new Error("Missing transaction_id (please upload again so backend returns transaction_id).");
      }

      setSaving(true);

      const transferred_at = buildTransferredAtISO(form.date, form.time);

      // ✅ payload สำหรับ PATCH
      const payload = {
        bank: form.bank || null,
        amount: form.amount ? Number(String(form.amount).replace(/,/g, "")) : null,
        memo: form.detectedText || null,
        category: form.category || "Others",
        // ถ้า backend ใช้ transferred_at ให้ส่งไป
        transferred_at: transferred_at,
      };

      const res = await fetch(`${API_BASE}/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ สำคัญสุด
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

      alert("Saved ✅");
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
        <Button onClick={() => navigate("/slip/upload")}>Back</Button>
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
    <Box p={3}>
      <Paper elevation={6} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, overflow: "hidden", backgroundColor: colors.primary[400] }}>
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={900} color={colors.grey[100]}>
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

        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "360px 1fr 300px" }} gap={3} alignItems="start">
          {/* LEFT */}
          <Paper elevation={0} sx={{ borderRadius: 4, p: 2, backgroundColor: colors.primary[500], border: `1px solid ${colors.grey[700]}` }}>
            <Typography fontWeight={800} mb={1} color={colors.grey[100]}>
              Slip Preview
            </Typography>

            <Box sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${colors.grey[700]}` }}>
              <Box component="img" src={previewUrl} alt="slip" sx={{ width: "100%", display: "block", objectFit: "cover" }} />
            </Box>

            <Typography sx={{ color: colors.grey[300], mt: 1, fontSize: 13 }}>
              * ถ้ารูปไม่ชัด OCR อาจอ่านผิด (สามารถแก้ไขได้ในฟอร์ม)
            </Typography>

            {/* ✅ debug เล็ก ๆ ไม่กระทบ UI */}
            <Typography sx={{ color: colors.grey[500], mt: 1, fontSize: 12 }}>
              tx_id: {transactionId || "-"}
            </Typography>
          </Paper>

          {/* MIDDLE */}
          <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 2, md: 2.5 }, backgroundColor: colors.primary[500], border: `1px solid ${colors.grey[700]}` }}>
            <Typography fontWeight={900} mb={1} color={colors.grey[100]}>
              Extracted Data (Editable)
            </Typography>

            <Typography sx={{ color: colors.grey[300], mb: 2, fontSize: 13 }}>
              ระบบเดาหมวดหมู่จากคำที่เจอบนสลิปได้ (แก้ไขได้)
            </Typography>

            <Box sx={{ mb: 2, p: 1.5, borderRadius: 3, border: `1px solid ${colors.grey[700]}`, backgroundColor: colors.primary[600] }}>
              <Typography color={colors.grey[100]} fontWeight={800}>
                Auto Category:{" "}
                <span style={{ color: colors.greenAccent[300] }}>
                  {selectedCategoryObj?.emoji} {selectedCategoryObj?.label}
                </span>
              </Typography>
              <Typography sx={{ color: colors.grey[300], fontSize: 12, mt: 0.5 }}>
                * ถ้าเดาผิด ให้เลือกหมวดหมู่ใหม่ทางขวาได้เลย
              </Typography>
            </Box>

            <Stack spacing={2}>
              <TextField label="Bank" value={form.bank} onChange={setField("bank")} fullWidth sx={textFieldSx} />

              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2}>
                {/* ✅ DatePicker */}
                <DatePicker
                  label="Date"
                  value={dateVal}
                  onChange={(v) => {
                    setDateVal(v);
                    setForm((p) => ({ ...p, date: v ? v.format("YYYY-MM-DD") : "" }));
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: textFieldSx,
                    },
                  }}
                />

                {/* ✅ TimePicker */}
                <TimePicker
                  label="Time"
                  value={timeVal}
                  onChange={(v) => {
                    setTimeVal(v);
                    setForm((p) => ({ ...p, time: v ? v.format("HH:mm") : "" }));
                  }}
                  ampm={false} // 24 ชั่วโมง
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: textFieldSx,
                    },
                  }}
                />
              </Box>
            </LocalizationProvider>
              </Box>

              <TextField
                label="Amount"
                value={form.amount}
                onChange={setField("amount")}
                fullWidth
                inputMode="decimal"
                sx={textFieldSx}
                InputProps={{ endAdornment: <InputAdornment position="end">Baht</InputAdornment> }}
              />

              <TextField
                label="Detected Items (OCR)"
                value={form.detectedText}
                onChange={setField("detectedText")}
                fullWidth
                multiline
                minRows={1.5}
                placeholder='เช่น "ค่าข้าว", "กาแฟ", "Grab"...'
                sx={textFieldSx}
              />
            </Stack>

            <Divider sx={{ my: 2.5, borderColor: colors.grey[700] }} />

            <Box display="flex" gap={1.5}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  color: colors.greenAccent[300],
                  borderColor: colors.greenAccent[300],
                  "&:hover": { borderColor: colors.greenAccent[400], backgroundColor: colors.primary[700] },
                }}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                sx={{ backgroundColor: colors.greenAccent[600], fontWeight: 800, "&:hover": { backgroundColor: colors.greenAccent[700] } }}
                disabled={saving}
              >
                {saving ? <CircularProgress size={18} color="inherit" /> : "Save"}
              </Button>
            </Box>
          </Paper>

          {/* RIGHT: Category */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: 2.5,
              backgroundColor: colors.primary[500],
              border: `2px solid ${colors.grey[700]}`,
              position: { md: "sticky" },
              top: { md: 16 },
              height: "fit-content",
            }}
          >
            <Box sx={{ borderRadius: 3, p: 2, mb: 2, border: `1px solid ${colors.grey[700]}`, backgroundColor: colors.primary[600] }}>
              <Typography variant="h5" fontWeight={1000} color={colors.grey[100]}>
                Category
              </Typography>
              <Typography sx={{ color: colors.grey[300], mt: 0.5, fontSize: 13 }}>
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
                        <Box sx={{ fontSize: 18 }}>{c.emoji}</Box>
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
                      backgroundColor: active ? colors.primary[600] : colors.primary[500],
                      border: active ? `2px solid ${colors.greenAccent[400]}` : `1px solid ${colors.grey[700]}`,
                      boxShadow: active ? "0 10px 24px rgba(0,0,0,0.25)" : "none",
                      transform: active ? "scale(1.02)" : "scale(1)",
                      transition: "0.15s",
                      "&:hover": { backgroundColor: colors.primary[600], transform: active ? "scale(1.02)" : "scale(1.01)" },
                    }}
                  />
                );
              })}
            </Box>

            <Divider sx={{ my: 2, borderColor: colors.grey[700] }} />

            <Typography sx={{ color: colors.grey[300], fontSize: 13 }}>
              Selected:{" "}
              <b style={{ color: colors.grey[100] }}>
                {selectedCategoryObj?.emoji} {selectedCategoryObj?.label}
              </b>
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
