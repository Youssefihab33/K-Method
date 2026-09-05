import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Container, Grow, TextField, Button, Link, Alert, Box, Paper, Grid, InputAdornment, IconButton, Typography } from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import { UserContext } from './APIs/Context.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';
import AnimatedFace from './snippets/AnimatedFace.jsx';
import { useTitle } from 'react-use';

const loginFormSchema = yup
	.object({
		email: yup.string().required('Email is required!').email('Please enter a valid email address'),
		password: yup.string().required('Password is required!').min(8, 'Minimum 8 characters'),
	})
	.required();

export default function Login() {
	const { user, login } = useContext(UserContext);
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [faceState, setFaceState] = useState('default');
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || '/';
	useTitle('Login - K-Method');

	const { handleSubmit, control, setError, clearErrors } = useForm({
		resolver: yupResolver(loginFormSchema),
		defaultValues: { email: '', password: '' },
	});

	if (user) return <AlreadyLoggedIn />;

	const onSubmit = async (data) => {
		setAlert(null);
		clearErrors();
		setIsSubmitting(true);

		try {
			const response = await axiosInstance.post('/login/', data);
			if (response.status === 200) {
				// login() in Context handles token storage + navigation
				login(response.data.token, from);
			}
		} catch (error) {
			const errors = error.response?.data;
			if (errors) {
				// Handle field-specific errors from DRF
				if (errors.email) setError('email', { message: errors.email[0] });
				if (errors.password) setError('password', { message: errors.password[0] });

				// Handle generic / non_field_errors
				const generalMsg = errors.non_field_errors?.[0] || errors.detail || errors.error;
				if (generalMsg) setAlert({ type: 'error', message: generalMsg });
			} else {
				setAlert({ type: 'error', message: 'Connection to server failed. Please try again.' });
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Container sx={{ my: 5 }} maxWidth='sm'>
			{alert && (
				<Grow in={!!alert}>
					<Alert severity={alert.type} sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setAlert(null)}>
						{alert.message}
					</Alert>
				</Grow>
			)}

			<Paper
				elevation={0}
				sx={{
					p: { xs: 4, sm: 5 },
					textAlign: 'center',
					background: 'rgba(21, 24, 33, 0.45)',
					backdropFilter: 'blur(20px)',
					WebkitBackdropFilter: 'blur(20px)',
					border: '1px solid rgba(255, 255, 255, 0.08)',
					borderRadius: 4,
					boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
				}}
			>
				<AnimatedFace state={faceState} />
				<Typography
					variant='h4'
					component='h1'
					sx={{
						fontWeight: '800',
						mb: 4,
						color: 'text.primary',
						letterSpacing: '1px',
						fontFamily: 'Outfit, sans-serif',
					}}
				>
					Welcome Back
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={3}>
						{/* Email Input */}
						<Grid size={12}>
							<Controller
								name='email'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Email'
										type='email'
										autoComplete='email'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState('typing')}
										onBlur={() => setFaceState('default')}
									/>
								)}
							/>
						</Grid>

						{/* Second Input Column */}
						<Grid size={12}>
							<Controller
								name='password'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										type={showPassword ? 'text' : 'password'}
										label='Password'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
										onFocus={() => setFaceState(showPassword ? 'typing' : 'hiding')}
										onBlur={() => setFaceState('default')}
										slotProps={{
											input: {
												endAdornment: (
													<InputAdornment position='end'>
														<IconButton
															aria-label='toggle password visibility'
															onClick={() => {
																const nextShow = !showPassword;
																setShowPassword(nextShow);
																setFaceState(nextShow ? 'typing' : 'hiding');
															}}
															edge='end'
															sx={{ color: 'text.secondary' }}
														>
															{showPassword ? <VisibilityOff /> : <Visibility />}
														</IconButton>
													</InputAdornment>
												),
											},
										}}
									/>
								)}
							/>
						</Grid>

						{/* Submit Button */}
						<Grid size={12}>
							<Button
								type='submit'
								variant='contained'
								color='primary'
								fullWidth
								size='large'
								disabled={isSubmitting}
								startIcon={<LoginIcon />}
								sx={{
									py: 1.5,
									fontWeight: '700',
									fontSize: '1rem',
									boxShadow: '0 4px 14px 0 rgba(175, 145, 59, 0.3)',
									'&:hover': {
										boxShadow: '0 6px 20px 0 rgba(175, 145, 59, 0.5)',
									},
								}}
							>
								{isSubmitting ? 'Signing In...' : 'Sign In'}
							</Button>
						</Grid>
					</Grid>
				</form>
			</Paper>
		</Container>
	);
}
