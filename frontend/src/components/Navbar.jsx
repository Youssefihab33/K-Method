import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, isAuthenticated, logout, isTutor, isStaff } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="sticky" sx={{ backgroundColor: 'rgba(21, 24, 33, 0.1)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    <img src='/logo.png' style={{ height: 86, margin: 10 }} alt='K-Method' />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button color="primary" component={RouterLink} to="/">
                            Homepage
                        </Button>
                        {isAuthenticated ? (
                            <>
                                {/* <Button color="primary" component={RouterLink} to="/dashboard">
                                    Dashboard
                                </Button> */}

                                <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                        {user?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                                    </Avatar>
                                </IconButton>
                                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                                    <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>Profile</MenuItem>
                                    {isStaff && <MenuItem onClick={() => { handleClose(); navigate('/auth/admin'); }}>Admin</MenuItem>}
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={RouterLink} to="/login">
                                    Sign In
                                </Button>
                                <Button variant="contained" color="primary" component={RouterLink} to="/register">
                                    Register
                                </Button>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}