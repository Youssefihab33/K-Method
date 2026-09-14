import { useState } from 'react';
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
  Paper,
} from '@mui/material';
import { useTitle } from 'react-use';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';

export default function Profile() {
  const { user, isTutor, isStudent, changePassword } = useAuth();
  useTitle('Profile - K-Method');

  // State for Change Password form
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side confirmation validation
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      // Calls your change password handler from AuthContext or custom API call
      const data = await authService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      const respData = err.response?.data;
      if (respData) {
        const firstKey = Object.keys(respData)[0];
        const msg = Array.isArray(respData[firstKey]) ? respData[firstKey][0] : respData[firstKey];
        setError(`${firstKey}: ${msg}`);
      } else {
        setError('Failed to change password. Please check your old password and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Card sx={{ p: 2 }}>
        <CardContent>
          {/* Header & Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {user?.email}
              </Typography>

              {/* Role Badges (Conditional Display) */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {isStudent && <Chip label="Student" color="primary" variant="filled" size="small" />}
                {isTutor && <Chip label="Tutor" color="secondary" variant="filled" size="small" />}
                {(user?.is_admin || user?.is_superuser || user?.is_staff) && (
                  <Chip label="Admin" color="error" variant="filled" size="small" />
                )}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* System Notifications */}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Read-Only Profile Details */}
          <Box sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Personal Information
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Contact an admin to update your data
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={user?.first_name || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={user?.last_name || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={user?.phone_number || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent's Phone Number"
                  value={user?.parent_phone_number || user?.parent_phone || ''}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Change Password Section */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Change Password
            </Typography>

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Old Password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </Box>
            </Box>
          </Paper>

        </CardContent>
      </Card>
    </Container>
  );
}