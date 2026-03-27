import {
  Box,
  Button,
  Typography,
  useTheme,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const LoadingOverlay = ({ open, progress = 0, done = false, colors }) => {
  if (!open) return null;

  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const fillH = `${pct}%`;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 4,
          p: { xs: 2.25, sm: 3 },
          textAlign: "center",
          backgroundColor: colors.primary[400],
          border: `1px solid ${colors.primary[600]}`,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ color: colors.grey[100], mb: 0.75 }}
        >
          {done ? "Completed" : "Processing your slip"}
        </Typography>

        <Typography sx={{ color: colors.grey[300], mb: 2.25 }}>
          {done ? "OCR finished successfully" : "Please wait… OCR is extracting"}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            sx={{
              width: { xs: 170, sm: 190 },
              height: { xs: 170, sm: 190 },
              borderRadius: "50%",
              position: "relative",
              overflow: "hidden",
              border: `3px solid ${colors.primary[600]}`,
              backgroundColor: colors.primary[500],
              boxShadow: "inset 0 0 0 6px rgba(255,255,255,0.03)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: fillH,
                background: `linear-gradient(180deg, ${colors.greenAccent[400]} 0%, ${colors.greenAccent[700]} 100%)`,
                transition: "height 280ms ease",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                left: "-45%",
                width: "190%",
                height: 70,
                bottom: `calc(${fillH} - 28px)`,
                borderRadius: "45%",
                backgroundColor: "rgba(255,255,255,0.20)",
                animation: done ? "none" : "wave1 2.3s linear infinite",
                "@keyframes wave1": {
                  "0%": { transform: "translateX(0) rotate(0deg)" },
                  "100%": { transform: "translateX(22%) rotate(360deg)" },
                },
                transition: "bottom 280ms ease",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                left: "-60%",
                width: "220%",
                height: 86,
                bottom: `calc(${fillH} - 36px)`,
                borderRadius: "42%",
                backgroundColor: "rgba(0,0,0,0.06)",
                animation: done ? "none" : "wave2 3.1s linear infinite",
                "@keyframes wave2": {
                  "0%": { transform: "translateX(0) rotate(0deg)" },
                  "100%": { transform: "translateX(16%) rotate(-360deg)" },
                },
                transition: "bottom 280ms ease",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 0.5,
              }}
            >
              {done && pct >= 100 ? (
                <>
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 70, color: colors.greenAccent[400] }}
                  />
                  <Typography sx={{ color: colors.grey[100], fontWeight: 900 }}>
                    Success
                  </Typography>
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      color: colors.grey[100],
                      fontWeight: 900,
                      fontSize: 36,
                      lineHeight: 1,
                      textShadow: "0 2px 10px rgba(0,0,0,0.22)",
                    }}
                  >
                    {pct}%
                  </Typography>
                  <Typography sx={{ color: colors.grey[300], fontSize: 13 }}>
                    working…
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Typography sx={{ mt: 2.25, color: colors.grey[300], fontSize: 14 }}>
          {done ? "Redirecting…" : "Please keep this page open"}
        </Typography>
      </Paper>
    </Box>
  );
};

const SlipUpload = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState("");

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const f = event.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setResp(null);
    setError("");
    setDuplicateInfo(null);
    setDuplicateOpen(false);
  };

  const startFakeProgress = () => {
    return setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        const step = p < 60 ? 3 : p < 80 ? 1.5 : 0.8;
        return Math.min(90, p + step);
      });
    }, 120);
  };


  const goToResult = async (data) => {
    setResp(data);
    setProgress(100);
    setDone(true);

    await new Promise((r) => setTimeout(r, 650));

    navigate("/slip/result", {
      state: {
        previewUrl,
        ocr: {
          ...(data?.extracted || {}),
          memo: data?.memo ?? data?.extracted?.memo ?? null,
          suggested_category:
            data?.suggested_category ??
            data?.extracted?.suggested_category ??
            null,
          category_required:
            data?.category_required ??
            data?.extracted?.category_required ??
            false,
          transaction_id: data?.transaction_id ?? null,
        },
        transaction_id: data?.transaction_id ?? null,
      },
    });
  };

  const uploadSlip = async (forceUpload = false) => {
    if (!selectedFile) {
      throw new Error("Please select a file first");
    }

    setLoading(true);
    setDone(false);
    setProgress(0);
    setResp(null);
    setError("");

    let timer = startFakeProgress();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("force_upload", String(forceUpload));

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      const res = await fetch(`${API_BASE}/upload/`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }

      if (data?.duplicate === true && !forceUpload) {
        clearInterval(timer);
        timer = null;

        setLoading(false);
        setDone(false);
        setProgress(0);

        setDuplicateInfo(data);
        setDuplicateOpen(true);
        return;
      }

      clearInterval(timer);
      timer = null;

      await goToResult(data);
    } catch (err) {
      setError(err?.message || "Upload failed");
    } finally {
      if (timer) clearInterval(timer);
      setLoading(false);
      setDone(false);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    await uploadSlip(false);
  };

  const handleConfirmDuplicate = async () => {
    setDuplicateOpen(false);
    await uploadSlip(true);
  };

  const handleCancelDuplicate = () => {
    setDuplicateOpen(false);
    setDuplicateInfo(null);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <LoadingOverlay
        open={loading}
        progress={progress}
        done={done}
        colors={colors}
      />

      <Dialog
  open={duplicateOpen}
  onClose={handleCancelDuplicate}
  fullWidth
  maxWidth="sm"
  PaperProps={{
    sx: {
      backgroundColor: colors.primary[400],
      color: colors.grey[100],
      borderRadius: 4,
      border: `1px solid ${colors.primary[600]}`,
      boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      overflow: "hidden",
    },
  }}
>
  <DialogTitle
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      pb: 1.5,
      fontWeight: 800,
      fontSize: "1.15rem",
      color: colors.grey[100],
      background: `linear-gradient(180deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`,
      borderBottom: `1px solid ${colors.primary[600]}`,
    }}
  >
    <WarningAmberRoundedIcon sx={{ color: colors.greenAccent[400] }} />
    Duplicate Slip Detected
  </DialogTitle>

  <DialogContent
    sx={{
      pt: "20px !important",
      backgroundColor: colors.primary[400],
    }}
  >
    <DialogContentText
      sx={{
        mb: 2,
        color: colors.grey[300],
        lineHeight: 1.8,
      }}
    >
      พบว่าสลิปนี้อาจเคยถูกอัปโหลดแล้ว ต้องการอัปโหลดซ้ำและทำ OCR ต่อหรือไม่?
    </DialogContentText>

    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: colors.primary[500],
        border: `1px solid ${colors.primary[600]}`,
      }}
    >
      {duplicateInfo?.existing_filename && (
        <Typography
          variant="body2"
          sx={{ color: colors.grey[100], mb: 1, fontWeight: 600 }}
        >
          ไฟล์เดิม:{" "}
          <Box component="span" sx={{ color: colors.greenAccent[400] }}>
            {duplicateInfo.existing_filename}
          </Box>
        </Typography>
      )}

      {duplicateInfo?.message && (
        <Typography
          variant="body2"
          sx={{ color: colors.grey[300] }}
        >
          {duplicateInfo.message}
        </Typography>
      )}
    </Box>
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      pb: 2.5,
      pt: 1.5,
      backgroundColor: colors.primary[400],
    }}
  >
    <Button
      onClick={handleCancelDuplicate}
      variant="outlined"
      sx={{
        color: colors.grey[200],
        borderColor: colors.grey[600],
        px: 2.5,
        borderRadius: 2,
        textTransform: "none",
        "&:hover": {
          borderColor: colors.grey[400],
          backgroundColor: colors.primary[500],
        },
      }}
    >
      Cancel
    </Button>

    <Button
      onClick={handleConfirmDuplicate}
      variant="contained"
      sx={{
        px: 2.5,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 700,
        backgroundColor: colors.greenAccent[600],
        color: "#fff",
        "&:hover": {
          backgroundColor: colors.greenAccent[700],
        },
      }}
    >
      Upload Anyway
    </Button>
  </DialogActions>
</Dialog>

      <Header
        title="UPLOAD SLIP"
        subtitle="Upload transfer slip for OCR processing"
      />

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: "100%",
            maxWidth: 900,
            p: { xs: 2.25, sm: 3.5 },
            backgroundColor: colors.primary[400],
            borderRadius: { xs: 3, sm: 4 },
          }}
        >
          <Box textAlign="center" mb={{ xs: 2, sm: 3 }}>
            <Typography
              variant="h4"
              fontWeight="700"
              color={colors.grey[100]}
              sx={{ fontSize: { xs: 22, sm: 28 } }}
            >
              Upload Slip 
            </Typography>
            <Typography variant="body2" color={colors.grey[300]} mt={1}>
              Upload your transfer slip image for automatic OCR extraction
            </Typography>
          </Box>

          <Divider
            sx={{ mb: { xs: 2, sm: 3 }, borderColor: colors.grey[700] }}
          />

          <Box
            sx={{
              border: `2px dashed ${colors.greenAccent[400]}`,
              borderRadius: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3.5 },
              textAlign: "center",
              backgroundColor: colors.primary[500],
              transition: "0.25s",
              "&:hover": { backgroundColor: colors.primary[600] },
            }}
          >
            <UploadFileOutlinedIcon
              sx={{
                fontSize: { xs: 40, sm: 52 },
                color: colors.greenAccent[400],
                mb: 1.5,
              }}
            />

            <Typography
              variant="h6"
              mb={1}
              color={colors.grey[100]}
              sx={{ fontSize: { xs: 16, sm: 18 } }}
            >
              Drag & drop your slip here
            </Typography>

            <Typography variant="body2" mb={2.5} color={colors.grey[400]}>
              or select an image from your device
            </Typography>

            <Box sx={{ maxWidth: 420, mx: "auto" }}>
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
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </Button>
            </Box>

            {selectedFile && (
              <Box mt={2}>
                <Typography variant="body2" color={colors.grey[300]}>
                  Selected file: <strong>{selectedFile.name}</strong>
                </Typography>

                {previewUrl && (
                  <Box
                    mt={2}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="preview"
                      sx={{
                        width: "100%",
                        maxWidth: 520,
                        maxHeight: { xs: 260, sm: 320, md: 360 },
                        objectFit: "contain",
                        borderRadius: 2,
                        border: `1px solid ${colors.primary[600]}`,
                        backgroundColor: colors.primary[500],
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Box mt={{ xs: 3, sm: 4 }} sx={{ maxWidth: 420, mx: "auto" }}>
            <Button
              variant="contained"
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CloudUploadOutlinedIcon />
                )
              }
              onClick={handleUpload}
              sx={{
                backgroundColor: colors.greenAccent[600],
                py: 1.2,
                fontSize: 16,
                "&:hover": { backgroundColor: colors.greenAccent[700] },
              }}
              fullWidth
              size="large"
              disabled={!selectedFile || loading}
            >
              {loading ? "Uploading..." : "Upload Slip"}
            </Button>
          </Box>

          <Box mt={3}>
            {error && <Alert severity="error">{error}</Alert>}

            {resp && (
              <Box mt={2}>
                <Alert severity="success">OCR processed successfully</Alert>

                <Box mt={1.5}>
                  <Typography color={colors.grey[100]} fontWeight={700}>
                    Extracted
                  </Typography>

                  <Box
                    sx={{
                      mt: 1,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 1,
                    }}
                  >
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
                      Suggested Category:{" "}
                      {resp?.extracted?.suggested_category ?? "-"}
                    </Typography>
                  </Box>
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