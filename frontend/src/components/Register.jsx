import { useState } from 'react';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, Link, FormControlLabel, RadioGroup, Radio, FormLabel } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone_number: formData.phone_number,
      password: formData.password,
      is_student: formData.role === 'student',
      is_tutor: formData.role === 'tutor',
    };

    try {
      await register(payload);
      navigate('/');
    } catch (err) {
      const respData = err.response?.data;
      if (respData) {
        const firstErrKey = Object.keys(respData)[0];
        const errMsg = Array.isArray(respData[firstErrKey]) ? respData[firstErrKey][0] : respData[firstErrKey];
        setError(`${firstErrKey}: ${errMsg}`);
      } else {
        setError('Registration failed. Check inputs.');
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
            Create Account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth margin="normal" label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
              <TextField fullWidth margin="normal" label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </Box>
            <TextField fullWidth margin="normal" label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Phone Number (+20...)" name="phone_number" value={formData.phone_number} onChange={handleChange} required />
            <TextField fullWidth margin="normal" label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />

            <Box sx={{ mt: 2, mb: 2 }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup row name="role" value={formData.role} onChange={handleChange}>
                <FormControlLabel value="student" control={<Radio />} label="Student" />
                <FormControlLabel value="tutor" control={<Radio />} label="Tutor" />
              </RadioGroup>
            </Box>

            <Button type="submit" fullWidth variant="contained" color="primary" size="large" disabled={loading} sx={{ mt: 2, mb: 2 }}>
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2" color="text.secondary">
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}