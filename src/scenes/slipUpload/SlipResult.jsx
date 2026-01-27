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
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { tokens } from "../../theme";

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

  // Food
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
  ) return "Food&Drink";

  // Transport
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
  ) return "Transport";

  // Shopping
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
  ) return "Shopping";

  // Utilities
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
  ) return "Utilities";

  return "Others";
}

export default function SlipResult() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { state } = useLocation();
  const navigate = useNavigate();

  const previewUrl = state?.previewUrl;
  const ocr = state?.ocr;

  // ✅ รวมข้อความ OCR ที่อาจมีหลาย field (ปรับได้ตาม backend จริงทีหลัง)
  const ocrText = useMemo(() => {
    const t1 = ocr?.text || "";       // แนะนำให้ backend ส่ง field นี้
    const t2 = ocr?.rawText || "";    // หรือ field นี้
    const t3 = Array.isArray(ocr?.lines) ? ocr.lines.join(" ") : "";
    return [t1, t2, t3].filter(Boolean).join(" ").trim();
  }, [ocr]);

  // ✅ เดาหมวดหมู่จากข้อความ (ถ้าไม่มี category จาก OCR)
  const guessedCategory = useMemo(() => guessCategoryFromText(ocrText), [ocrText]);

  const initial = useMemo(
    () => ({
      bank: ocr?.bank || "",
      date: ocr?.date || "",
      time: ocr?.time || "",
      amount: ocr?.amount || "",
      // ✅ เพิ่ม field แสดงคำที่ OCR เจอ (แก้ได้)
      detectedText: ocrText || "",
      // ✅ ถ้า OCR ส่ง category มา ใช้อันนั้นก่อน ไม่งั้นใช้ที่เดาได้
      category: ocr?.category || guessedCategory || "Others",
    }),
    [ocr, ocrText, guessedCategory]
  );

  const [form, setForm] = useState(initial);

  // ✅ ถ้า state/ocr เปลี่ยน (เช่นอัปโหลดใหม่) ให้รีเซ็ตฟอร์มด้วย
  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const setField = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSave = () => {
    console.log("SAVE:", form);
    alert("Saved ✅");
    navigate("/transactions");
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
          <Typography variant="h4" fontWeight={900} color={colors.grey[100]}>
            Result
          </Typography>
          <Typography sx={{ color: colors.grey[300], mt: 0.5 }}>
            ตรวจสอบและแก้ไขข้อมูลที่ OCR อ่านได้ จากนั้นเลือกหมวดหมู่ค่าใช้จ่าย
          </Typography>
        </Box>

        <Divider sx={{ my: 3, borderColor: colors.grey[700] }} />

        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", md: "360px 1fr 300px" }}
          gap={3}
          alignItems="start"
        >
          {/* LEFT */}
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
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt="slip"
                sx={{ width: "100%", display: "block", objectFit: "cover" }}
              />
            </Box>

            <Typography sx={{ color: colors.grey[300], mt: 1, fontSize: 13 }}>
              * ถ้ารูปไม่ชัด OCR อาจอ่านผิด (สามารถแก้ไขได้ในฟอร์ม)
            </Typography>
          </Paper>

          {/* MIDDLE */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              backgroundColor: colors.primary[500],
              border: `1px solid ${colors.grey[700]}`,
            }}
          >
            <Typography fontWeight={900} mb={1} color={colors.grey[100]}>
              Extracted Data (Editable)
            </Typography>

            <Typography sx={{ color: colors.grey[300], mb: 2, fontSize: 13 }}>
              ระบบเดาหมวดหมู่จากคำที่เจอบนสลิปได้ (แก้ไขได้)
            </Typography>

            {/* ✅ แถบเดาหมวดหมู่ */}
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
                  {selectedCategoryObj?.emoji} {selectedCategoryObj?.label}
                </span>
              </Typography>
              <Typography sx={{ color: colors.grey[300], fontSize: 12, mt: 0.5 }}>
                * ถ้าเดาผิด ให้เลือกหมวดหมู่ใหม่ทางขวาได้เลย
              </Typography>
            </Box>

            <Stack spacing={2}>
              <TextField
                label="Bank"
                value={form.bank}
                onChange={setField("bank")}
                fullWidth
                sx={textFieldSx}
              />

              <Box
                display="grid"
                gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                gap={2}
              >
                <TextField
                  label="DD/MM/YY"
                  value={form.date}
                  onChange={setField("date")}
                  fullWidth
                  sx={textFieldSx}
                />
                <TextField
                  label="Time"
                  value={form.time}
                  onChange={setField("time")}
                  fullWidth
                  sx={textFieldSx}
                />
              </Box>

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

              {/* ✅ เพิ่มช่องคำที่ OCR เจอ (แก้ได้) */}
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
                  "&:hover": {
                    borderColor: colors.greenAccent[400],
                    backgroundColor: colors.primary[700],
                  },
                }}
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
              >
                Save
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
            <Box
              sx={{
                borderRadius: 3,
                p: 2,
                mb: 2,
                border: `1px solid ${colors.grey[700]}`,
                backgroundColor: colors.primary[600],
              }}
            >
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
                      border: active
                        ? `2px solid ${colors.greenAccent[400]}`
                        : `1px solid ${colors.grey[700]}`,
                      boxShadow: active ? "0 10px 24px rgba(0,0,0,0.25)" : "none",
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
                {selectedCategoryObj?.emoji} {selectedCategoryObj?.label}
              </b>
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
}
