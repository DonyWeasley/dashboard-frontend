import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Avatar,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
  Chip,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";

import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  sessionStorage.getItem("access_token") ||
  "";

const Form = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [initialValues, setInitialValues] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setErr("");
      setSuccess("");

      try {
        const token = getToken();

        const res = await fetch(`${API_BASE}/profile/`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const text = await res.text();
        if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

        const data = text ? JSON.parse(text) : {};

        setInitialValues({
          displayName: data?.display_name || data?.username || "",
          firstName: data?.first_name || "",
          lastName: data?.last_name || "",
          email: data?.email || "",
          phone: data?.phone || "",
        });

        if (data?.profile_image_url) {
          setPreviewUrl(`${API_BASE}${data.profile_image_url}`);
        }
      } catch (error) {
        setErr(error?.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (values) => {
    setSaving(true);
    setErr("");
    setSuccess("");

    try {
      const token = getToken();

      const profileRes = await fetch(`${API_BASE}/profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          display_name: values.displayName,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
        }),
      });

      const profileText = await profileRes.text();
      if (!profileRes.ok) {
        throw new Error(profileText || `HTTP ${profileRes.status}`);
      }

      const profileData = profileText ? JSON.parse(profileText) : {};

      if (profileImage) {
        const formData = new FormData();
        formData.append("file", profileImage);

        const imageRes = await fetch(`${API_BASE}/profile/image`, {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        const imageText = await imageRes.text();
        if (!imageRes.ok) {
          throw new Error(imageText || `HTTP ${imageRes.status}`);
        }

        const imageData = imageText ? JSON.parse(imageText) : {};
        if (imageData?.profile_image_url) {
          setPreviewUrl(`${API_BASE}${imageData.profile_image_url}`);
        }
      } else if (profileData?.profile?.profile_image_url) {
        setPreviewUrl(`${API_BASE}${profileData.profile.profile_image_url}`);
      }

      setSuccess("Profile saved successfully");
      setProfileImage(null);
    } catch (error) {
      setErr(error?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const inputSx = {
    "& .MuiFilledInput-root": {
      borderRadius: "12px",
      backgroundColor: colors.primary[500],
      overflow: "hidden",
      "&:hover": {
        backgroundColor: colors.primary[500],
      },
      "&.Mui-focused": {
        backgroundColor: colors.primary[500],
      },
    },
    "& .MuiInputLabel-root": {
      color: colors.grey[300],
    },
    "& .MuiFilledInput-input": {
      color: colors.grey[100],
    },
    "& .MuiFormHelperText-root": {
      color: colors.grey[400],
      marginLeft: 0,
    },
  };

  if (loadingProfile) {
    return (
      <Box sx={{ m: { xs: 1.5, sm: 2, md: "20px" } }}>
        <Header title="PROFILE" subtitle="Can Edit User Profile" />
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 3,
            borderRadius: "18px",
            backgroundColor: colors.primary[400],
            border: `1px solid ${colors.primary[500]}`,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            maxWidth: 900,
          }}
        >
          <CircularProgress size={22} />
          <Typography color={colors.grey[100]}>Loading profile...</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ m: { xs: 1.5, sm: 2, md: "20px" } }}>
      <Header title="PROFILE" subtitle="Can Edit User Profile" />

      {err && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>
          {err}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: "12px" }}>
          {success}
        </Alert>
      )}

      <Formik
        enableReinitialize
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                backgroundColor: colors.primary[400],
                borderRadius: "18px",
                border: `1px solid ${colors.primary[500]}`,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                maxWidth: 1100,
                mx: "auto",
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
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: colors.grey[100],
                        fontWeight: 800,
                        fontSize: { xs: 20, md: 24 },
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <PersonOutlineOutlinedIcon />
                      โปรไฟล์ผู้ใช้งาน
                    </Typography>
                    <Typography
                      sx={{
                        color: colors.grey[300],
                        mt: 0.5,
                        fontSize: 13,
                      }}
                    >
                      แก้ไขข้อมูลส่วนตัวและอัปโหลดรูปโปรไฟล์ของคุณ
                    </Typography>
                  </Box>

                  <Chip
                    label="Profile Settings"
                    sx={{
                      fontWeight: 700,
                      backgroundColor: colors.greenAccent[600],
                      color: "#111",
                    }}
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  gridColumn: "span 4",
                  mb: 3,
                  p: { xs: 2, md: 2.5 },
                  borderRadius: "16px",
                  backgroundColor: colors.primary[500],
                  border: `1px solid ${colors.primary[600] || colors.primary[500]}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <Avatar
                    src={previewUrl}
                    alt="Profile Preview"
                    sx={{
                      width: 92,
                      height: 92,
                      border: `3px solid ${colors.greenAccent[500]}`,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      color={colors.grey[100]}
                      fontWeight={800}
                      fontSize={16}
                    >
                      รูปโปรไฟล์
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        mb: 1.5,
                        color: colors.grey[300],
                      }}
                    >
                      อัปโหลดรูปใหม่เพื่อใช้แสดงบนบัญชีของคุณ
                    </Typography>

                    <Button
                      variant="contained"
                      component="label"
                      disabled={saving}
                      startIcon={<CloudUploadOutlinedIcon />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: "12px",
                        backgroundColor: colors.greenAccent[600],
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: colors.greenAccent[700],
                          boxShadow: "none",
                        },
                      }}
                    >
                      Upload Profile Image
                      <input
                        hidden
                        accept="image/*"
                        type="file"
                        onChange={handleImageChange}
                      />
                    </Button>

                    <Typography
                      variant="body2"
                      sx={{ mt: 1.25, color: colors.grey[400] }}
                    >
                      รองรับไฟล์ .jpg, .png, .webp
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ mb: 3, borderColor: colors.primary[500] }} />

              <Box
                display="grid"
                gap="22px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Display Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.displayName}
                  name="displayName"
                  error={!!touched.displayName && !!errors.displayName}
                  helperText={touched.displayName && errors.displayName}
                  sx={{ ...inputSx, gridColumn: "span 4" }}
                  InputProps={{
                    startAdornment: (
                      <BadgeOutlinedIcon
                        sx={{ mr: 1, color: colors.grey[400], fontSize: 20 }}
                      />
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="First Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.firstName}
                  name="firstName"
                  error={!!touched.firstName && !!errors.firstName}
                  helperText={touched.firstName && errors.firstName}
                  sx={{ ...inputSx, gridColumn: "span 2" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Last Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.lastName}
                  name="lastName"
                  error={!!touched.lastName && !!errors.lastName}
                  helperText={touched.lastName && errors.lastName}
                  sx={{ ...inputSx, gridColumn: "span 2" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="email"
                  label="Email"
                  value={values.email}
                  name="email"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <EmailOutlinedIcon
                        sx={{ mr: 1, color: colors.grey[400], fontSize: 20 }}
                      />
                    ),
                  }}
                  sx={{ ...inputSx, gridColumn: "span 4" }}
                  helperText="Email is from your registered account"
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Phone"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.phone}
                  name="phone"
                  error={!!touched.phone && !!errors.phone}
                  helperText={touched.phone && errors.phone}
                  sx={{ ...inputSx, gridColumn: "span 4" }}
                  InputProps={{
                    startAdornment: (
                      <PhoneOutlinedIcon
                        sx={{ mr: 1, color: colors.grey[400], fontSize: 20 }}
                      />
                    ),
                  }}
                />
              </Box>

              <Box
                display="flex"
                justifyContent="end"
                mt="28px"
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={
                    saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />
                  }
                  sx={{
                    minWidth: 150,
                    height: 42,
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "12px",
                    backgroundColor: colors.greenAccent[600],
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: colors.greenAccent[700],
                      boxShadow: "none",
                    },
                  }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </Box>
            </Paper>
          </form>
        )}
      </Formik>
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  displayName: yup.string().required("required"),
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  phone: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
});

export default Form;