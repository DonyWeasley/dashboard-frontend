import {
  Box,
  Button,
  Typography,
  useTheme,
  Paper,
  Divider,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useState } from "react";

const SlipUpload = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file first");
      return;
    }
    console.log("Uploading file:", selectedFile);
  };

  return (
    <Box m="20px">
      <Header
        title="SLIP UPLOAD"
        subtitle="Upload transfer slip for OCR processing"
      />

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
            maxWidth: "900px", // ⬅️ จาก 1200 → 900 (กำลังสวย)
            minHeight: "auto", // ⬅️ ไม่บังคับสูงเกิน
            p: "32px", // ⬅️ จาก 48 → 32
            backgroundColor: colors.primary[400],
            borderRadius: "16px", // ⬅️ นุ่มแต่ไม่เวอร์
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
              "&:hover": {
                backgroundColor: colors.primary[600],
              },
            }}
          >
            <UploadFileOutlinedIcon
              sx={{
                fontSize: "48px",
                color: colors.greenAccent[400],
                mb: "16px",
              }}
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
              >
                Select File
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            {selectedFile && (
              <Typography variant="body2" mt="20px" color={colors.grey[300]}>
                Selected file: <strong>{selectedFile.name}</strong>
              </Typography>
            )}
          </Box>

          {/* Upload Button */}
          <Box mt="40px" maxWidth="420px" mx="auto">
            <Button
              variant="contained"
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={handleUpload}
              sx={{
                backgroundColor: colors.greenAccent[600],
                py: "10px",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: colors.greenAccent[700],
                },
              }}
              fullWidth
              size="large"
            >
              Upload Slip
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default SlipUpload;
