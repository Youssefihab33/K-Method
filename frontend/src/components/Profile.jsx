import { useState, useContext } from 'react';
import { Container, Typography, Paper, TextField, Button, Grid, Box, Alert, Avatar } from '@mui/material';
import { UserContext } from './APIs/Context.jsx';
import axiosInstance from './APIs/Axios.jsx';
import { useTitle } from 'react-use';

export default function Profile() {
    const { user, setUser } = useContext(UserContext);
    const [formData, setFormData] = useState({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        student_profile: user.student_profile || {},
        tutor_profile: user.tutor_profile || {}
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useTitle('Profile - K-Method');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const res = await axiosInstance.patch('/users/current/', formData);
            setUser(res.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main', fontSize: '2rem' }}>
                        {user.first_name[0]}{user.last_name[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="h4">{user.first_name} {user.last_name}</Typography>
                        <Typography color="text.secondary">{user.is_tutor ? 'Tutor' : 'Student'}</Typography>
                    </Box>
                </Box>

                {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
                        </Grid>

                        {user.is_student && (
                            <>
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth 
                                        label="Parents' Phone Number" 
                                        name="student_profile.parents_phone" 
                                        value={formData.student_profile.parents_phone || ''} 
                                        onChange={handleChange} 
                                        helperText="Required for students"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField 
                                        fullWidth 
                                        label="University ID" 
                                        name="student_profile.uni_id" 
                                        value={formData.student_profile.uni_id || ''} 
                                        onChange={handleChange} 
                                    />
                                </Grid>
                            </>
                        )}

                        {user.is_tutor && (
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    multiline 
                                    rows={4} 
                                    label="About Me" 
                                    name="tutor_profile.about" 
                                    value={formData.tutor_profile.about || ''} 
                                    onChange={handleChange} 
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" size="large" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
}
