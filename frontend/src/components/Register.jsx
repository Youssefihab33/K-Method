import { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  MenuItem,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

export default function Register() {
  // Step 1: Request Code | Step 2: Verify Code | Step 3: Complete Details
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    parent_phone_number: '',
    school: '',
    student_id: '',
    password: '',
    confirm_password: '',
  });

  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Fetch available schools when reaching Step 3
  useEffect(() => {
    if (step === 3) {
      setLoadingSchools(true);
      axiosClient
        .get('/schools/')
        .then((res) => {
          // Handle both paginated responses (res.data.results) and flat arrays (res.data)
          const schoolList = Array.isArray(res.data)
            ? res.data
            : res.data.results || [];
          setSchools(schoolList);
        })
        .catch((err) => {
          console.error('Failed to load schools:', err);
          setSchools([]);
        })
        .finally(() => setLoadingSchools(false));
    }
  }, [step]);

  // Helper to standardise Egyptian mobile numbers to E.164 (+20...) format
  const formatEgyptianPhone = (phone) => {
    if (!phone) return '';
    let cleaned = phone.replace(/[^0-9]/g, ''); // strip non-digits
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('20')) {
      cleaned = '20' + cleaned;
    }
    return `+${cleaned}`;
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step 1: Send verification code to student's email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      await axiosClient.post('/auth/send-email-code/', { email });
      setInfoMsg(`Verification code sent to ${email}. Please check your inbox.`);
      setStep(2);
    } catch (err) {
      const resp = err.response?.data;
      setError(resp?.detail || resp?.email || 'Failed to send verification code. Check your email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the code entered by the student
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');
    setLoading(true);

    try {
      await axiosClient.post('/auth/verify-email-code/', {
        email,
        code: verificationCode,
      });
      setInfoMsg('Email verified successfully! Complete your registration details below.');
      setStep(3);
    } catch (err) {
      const resp = err.response?.data;
      setError(resp?.detail || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Final registration submission
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    // Automatically prefix +20 to the student's local phone numbers
    const formattedPhone = formatEgyptianPhone(formData.phone_number);
    const formattedParentPhone = formatEgyptianPhone(formData.parent_phone_number);

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: email.toLowerCase().trim(),
      phone_number: formattedPhone,
      password: formData.password,
      is_student: true,
      is_tutor: false,
      // Profile specific details passed to nested serializer or backend signal handler
      student_profile: {
        parent_phone_number: formattedParentPhone,
        school: formData.school || null,
        student_id: formData.student_id || null,
      },
      // Flat payload fallback if your API handles fields directly
      parent_phone_number: formattedParentPhone,
      school: formData.school || null,
      student_id: formData.student_id || null,
    };

    try {
      await register(payload);
      navigate('/');
    } catch (err) {
      const respData = err.response?.data;
      if (respData) {
        const firstErrKey = Object.keys(respData)[0];
        const errMsg = Array.isArray(respData[firstErrKey])
          ? respData[firstErrKey][0]
          : respData[firstErrKey];
        setError(`${firstErrKey}: ${errMsg}`);
      } else {
        setError('Registration failed. Please check your inputs.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Student Registration
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {infoMsg && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {infoMsg}
            </Alert>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <Box component="form" onSubmit={handleSendCode} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your email address to receive a verification code before creating your account.
              </Typography>

              <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification Code'}
              </Button>
            </Box>
          )}

          {/* STEP 2: Verify Code */}
          {step === 2 && (
            <Box component="form" onSubmit={handleVerifyCode} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                We sent a verification code to <strong>{email}</strong>. Enter it below to proceed.
              </Typography>

              <TextField
                fullWidth
                margin="normal"
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="e.g. 123456"
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
              </Button>

              <Box textAlign="center">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setInfoMsg('');
                  }}
                >
                  Change Email / Resend
                </Button>
              </Box>
            </Box>
          )}

          {/* STEP 3: Complete Account Details */}
          {step === 3 && (
            <Box component="form" onSubmit={handleSubmitRegistration} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                />
              </Box>

              <TextField
                fullWidth
                margin="normal"
                label="Student Phone Number"
                name="phone_number"
                placeholder="01xxxxxxxx"
                value={formData.phone_number}
                onChange={handleInputChange}
                helperText="Type local Egyptian number (e.g., 01200770572)"
                required
              />

              <TextField
                fullWidth
                margin="normal"
                label="Parent's Phone Number"
                name="parent_phone_number"
                placeholder="01xxxxxxxx"
                value={formData.parent_phone_number}
                onChange={handleInputChange}
                helperText="Type local Egyptian number (e.g., 01000000000)"
                required
              />

              <TextField
                fullWidth
                select
                margin="normal"
                label="School"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                // required
                disabled={loadingSchools}
                helperText={loadingSchools ? 'Loading schools...' : 'Select your school or university'}
              >
                {schools.length > 0 ? (
                  schools.map((sch) => (
                    <MenuItem key={sch.id} value={sch.id}>
                      {sch.name} {sch.kind ? `(${sch.kind})` : ''}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>
                    No schools available
                  </MenuItem>
                )}
              </TextField>

              <div>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Student ID (Optional)"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                />
                <FormHelperText sx={{ mt: -0.5, mb: 1 }}>
                  Enter your official school/university registration number if applicable.
                </FormHelperText>
              </div>

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                error={
                  formData.confirm_password !== '' &&
                  formData.password !== formData.confirm_password
                }
                helperText={
                  formData.confirm_password !== '' &&
                  formData.password !== formData.confirm_password
                    ? 'Passwords do not match'
                    : ''
                }
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            </Box>
          )}

          <Box textAlign="center" sx={{ mt: 2 }}>
            <Link component={RouterLink} to="/login" variant="body2" color="text.secondary">
              Already have an account? Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}