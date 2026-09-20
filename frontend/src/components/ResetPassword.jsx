import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Box,
    CircularProgress,
    responsiveFontSizes,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { authService } from '../api/authService';

export default function ResetPassword() {
    const { uidb64, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            setMessage('');
            const response = await authService.passwordResetConfirmation(uidb64, token, password);
            setMessage(response.detail);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            const tokenErr = err.response?.data?.token?.[0];
            setError(tokenErr || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 10 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <LockOutlinedIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Set New Password
                </Typography>

                {success ? (
                    <Alert severity="success" sx={{ my: 2 }}>
                        { message }
                    </Alert>
                ) : (
                    <>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type="password"
                                variant="outlined"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                sx={{ mb: 3 }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ py: 1.2, mb: 2 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                            </Button>
                        </Box>
                    </>
                )}

                <Button component={RouterLink} to="/login" sx={{ textTransform: 'none' }}>
                    Back to Login
                </Button>
            </Paper>
        </Container>
    );
}