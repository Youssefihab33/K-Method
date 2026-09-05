import { AppBar, Toolbar, Typography, Button, Box, Container, Avatar, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { UserContext } from './APIs/Context.jsx';

export default function Navbar() {
    const { user, logout } = useContext(UserContext);
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleCloseUserMenu();
        logout();
        navigate('/login');
    };

    const handleProfile = () => {
        handleCloseUserMenu();
        navigate('/profile');
    };

    const handleDashboard = () => {
        handleCloseUserMenu();
        navigate('/');
    };

    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    {/* Placeholder for PNG Logo */}
                    <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', mr: 2 }}>
                        <img src="/logo.png" style={{ height: 116, marginRight: 10 }} alt='K-Method' />
                        {/* <Typography
                            variant="h6"
                            sx={{
                                color: 'primary.main',
                                fontWeight: 'bold',
                                letterSpacing: 2
                            }}
                        >
                            K-Method
                        </Typography>}*/}

                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ flexGrow: 0 }}>
                        {!user ? (
                            <>
                                <Button component={RouterLink} to="/login" color="inherit">Login</Button>
                                <Button component={RouterLink} to="/register" variant="outlined" sx={{ ml: 2 }}>Register</Button>
                            </>
                        ) : (
                            <>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            {user.first_name?.[0]}{user.last_name?.[0]}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorEl}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorEl)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem disabled>
                                        <Typography textAlign="center" variant="body2" color="text.secondary">
                                            {user.first_name} {user.last_name}
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem onClick={handleDashboard}>
                                        <Typography textAlign="center">Dashboard</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={handleProfile}>
                                        <Typography textAlign="center">Profile</Typography>
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Typography textAlign="center" color="error">Logout</Typography>
                                    </MenuItem>
                                </Menu>
                            </>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
