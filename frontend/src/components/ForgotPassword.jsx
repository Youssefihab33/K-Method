import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    Box,
    CircularProgress,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { authService } from '../api/authService';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await authService.passwordReset(email);
            setMessage(response.detail);
        } catch (err) {
            setError(err.response?.data?.detail || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 10 }}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <LockResetIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Forgot Password?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Enter your email address and we'll send you a link to reset your password.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


                {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> :
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                        </Button>
                    </Box>
                }


                <Button
                    component={RouterLink}
                    to="/login"
                    startIcon={<ArrowBackIcon />}
                    sx={{ textTransform: 'none' }}
                >
                    Back to Login
                </Button>
            </Paper>
        </Container>
    );
}