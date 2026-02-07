import {
  Box,
  Button,
  Typography,
  useTheme,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ เพิ่ม

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const SlipUpload = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); // ✅ เพิ่ม

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState("");

  // preview รูปแบบไว ๆ
  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const handleFileChange = (event) => {
    const f = event.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setResp(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }

    setLoading(true);
    setResp(null);
    setError("");

    try {
      const formData = new FormData();

      // 🔥 สำคัญ: ชื่อ field ต้องเป็น "file" ให้ตรงกับ backend
      formData.append("file", selectedFile);

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResp(data);

      // ✅ เพิ่ม: พาไปหน้า SlipResult พร้อมส่ง state (previewUrl + ocr + transaction_id)
      navigate("/slip/result", {
        state: {
          previewUrl, // ✅ ส่งรูปไปแสดงต่อ
          ocr: {
            ...(data?.extracted || {}),
            // ✅ เผื่อ backend ส่ง memo/suggested_category แยกนอก extracted ก็รองรับ
            memo: data?.memo ?? data?.extracted?.memo ?? null,
            suggested_category:
              data?.suggested_category ?? data?.extracted?.suggested_category ?? null,
            category_required:
              data?.category_required ?? data?.extracted?.category_required ?? false,

            // ✅ สำคัญสุด ใช้ไป PATCH /transactions/{id} ต่อ
            transaction_id: data?.transaction_id ?? null,
          },
          transaction_id: data?.transaction_id ?? null,
        },
      });
    } catch (err) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="SLIP UPLOAD" subtitle="Upload transfer slip for OCR processing" />

      <Box
        height="calc(100vh - 140px)"
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: "900px",
            minHeight: "auto",
            p: "32px",
            backgroundColor: colors.primary[400],
            borderRadius: "16px",
          }}
        >
          {/* Title */}
          <Box textAlign="center" mb="32px">
            <Typography variant="h4" fontWeight="600" color={colors.grey[100]}>
              Slip Upload
            </Typography>
            <Typography variant="body2" color={colors.grey[300]} mt="8px">
              Upload your transfer slip image for automatic OCR extraction
            </Typography>
          </Box>

          <Divider sx={{ mb: "32px", borderColor: colors.grey[700] }} />

          {/* Upload Area */}
          <Box
            sx={{
              border: `2px dashed ${colors.greenAccent[400]}`,
              borderRadius: "14px",
              p: "28px",
              textAlign: "center",
              backgroundColor: colors.primary[500],
              transition: "0.3s",
              "&:hover": { backgroundColor: colors.primary[600] },
            }}
          >
            <UploadFileOutlinedIcon
              sx={{ fontSize: "48px", color: colors.greenAccent[400], mb: "16px" }}
            />

            <Typography variant="h6" mb="8px" color={colors.grey[100]}>
              Drag & drop your slip here
            </Typography>

            <Typography variant="body2" mb="24px" color={colors.grey[400]}>
              or select an image from your device
            </Typography>

            <Box maxWidth="420px" mx="auto">
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFileOutlinedIcon />}
                sx={{
                  color: colors.greenAccent[300],
                  borderColor: colors.greenAccent[300],
                  "&:hover": {
                    borderColor: colors.greenAccent[400],
                    backgroundColor: colors.primary[700],
                  },
                }}
                fullWidth
                size="large"
                disabled={loading}
              >
                Select File
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Box>

            {selectedFile && (
              <>
                <Typography variant="body2" mt="20px" color={colors.grey[300]}>
                  Selected file: <strong>{selectedFile.name}</strong>
                </Typography>

                {previewUrl && (
                  <Box mt="16px">
                    <img
                      src={previewUrl}
                      alt="preview"
                      style={{ maxWidth: "100%", borderRadius: 12 }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Upload Button */}
          <Box mt="40px" maxWidth="420px" mx="auto">
            <Button
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={18} color="inherit" /> : <CloudUploadOutlinedIcon />
              }
              onClick={handleUpload}
              sx={{
                backgroundColor: colors.greenAccent[600],
                py: "10px",
                fontSize: "16px",
                "&:hover": { backgroundColor: colors.greenAccent[700] },
              }}
              fullWidth
              size="large"
              disabled={!selectedFile || loading}
            >
              {loading ? "Uploading..." : "Upload Slip"}
            </Button>
          </Box>

          {/* Result */}
          <Box mt="24px">
            {error && <Alert severity="error">{error}</Alert>}

            {resp && (
              <Box mt="16px">
                <Alert severity="success">OCR processed successfully</Alert>

                <Box mt="12px">
                  <Typography color={colors.grey[100]} fontWeight={600}>
                    Extracted
                  </Typography>
                  <Typography color={colors.grey[300]}>
                    Bank: {resp?.extracted?.bank ?? "-"}
                  </Typography>
                  <Typography color={colors.grey[300]}>
                    Amount: {resp?.extracted?.amount ?? "-"}
                  </Typography>
                  <Typography color={colors.grey[300]}>
                    Date: {resp?.extracted?.date ?? "-"}
                  </Typography>
                  <Typography color={colors.grey[300]}>
                    Time: {resp?.extracted?.time ?? "-"}
                  </Typography>
                  <Typography color={colors.grey[300]}>
                    Memo: {resp?.extracted?.memo ?? "-"}
                  </Typography>
                  <Typography color={colors.grey[300]}>
                    Suggested Category: {resp?.extracted?.suggested_category ?? "-"}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SlipUpload;
