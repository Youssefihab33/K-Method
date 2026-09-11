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
  Avatar,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { useTitle } from 'react-use';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUserProfile, isTutor, isStudent } = useAuth();
  useTitle('Profile - K-Method');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Pre-fill form values when user context loads or updates
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      const respData = err.response?.data;
      if (respData) {
        const firstKey = Object.keys(respData)[0];
        const msg = Array.isArray(respData[firstKey]) ? respData[firstKey][0] : respData[firstKey];
        setError(`${firstKey}: ${msg}`);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserRoleLabel = () => {
    if (isTutor) return 'Tutor';
    if (isStudent) return 'Student';
    return 'User';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Card sx={{ p: 2 }}>
        <CardContent>
          {/* Header & Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {user?.first_name ? `${user.first_name} ${user.last_name}` : 'User Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {user?.email}
              </Typography>
              <Chip label={getUserRoleLabel()} color="primary" variant="outlined" size="small" />
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* System Notifications */}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Editable Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Personal Details
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+20..."
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={user?.email || ''}
                  disabled
                  helperText="Email cannot be changed directly."
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}