import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useState, useContext } from 'react';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Container, Grow, TextField, Button, Link, Alert, Box, Paper, Grid, Typography } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

import axiosInstance from './APIs/Axios.jsx';
import { UserContext } from './APIs/Context.jsx';
import AlreadyLoggedIn from './snippets/AlreadyLoggedIn.jsx';
import { useTitle } from 'react-use';

const registerFormSchema = yup
	.object({
		first_name: yup.string().required('First name is required!'),
		last_name: yup.string().required('Last name is required!'),
		email: yup.string().required('Email is required!').email('Please enter a valid email address'),
		phone_number: yup.string().required('Phone number is required!'),
		password: yup.string().required('Password is required!').min(8, 'Minimum 8 characters'),
	})
	.required();

export default function Register() {
	const { user } = useContext(UserContext);
	const [alert, setAlert] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();
	useTitle('Register - K-Method');

	const { handleSubmit, control, setError, clearErrors } = useForm({
		resolver: yupResolver(registerFormSchema),
		defaultValues: { first_name: '', last_name: '', email: '', phone_number: '', password: '' },
	});

	if (user) return <AlreadyLoggedIn />;

	const onSubmit = async (data) => {
		setAlert(null);
		clearErrors();
		setIsSubmitting(true);

		try {
			const response = await axiosInstance.post('/register/', data);
			if (response.status === 201) {
				setAlert({ type: 'success', message: 'Registration successful! Please wait for admin approval before logging in.' });
                // We don't redirect immediately to let them read the message
			}
		} catch (error) {
			const errors = error.response?.data;
			if (errors) {
				if (errors.email) setError('email', { message: errors.email[0] });
				if (errors.phone_number) setError('phone_number', { message: errors.phone_number[0] });
				if (errors.first_name) setError('first_name', { message: errors.first_name[0] });
				if (errors.last_name) setError('last_name', { message: errors.last_name[0] });
				if (errors.password) setError('password', { message: errors.password[0] });

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
					Create Account
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Grid container spacing={3}>
						<Grid item xs={12} sm={6}>
							<Controller
								name='first_name'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='First Name'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Controller
								name='last_name'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Last Name'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='email'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Email'
										type='email'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='phone_number'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										label='Phone Number'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>
						<Grid item xs={12}>
							<Controller
								name='password'
								control={control}
								render={({ field, fieldState: { error } }) => (
									<TextField
										{...field}
										type='password'
										label='Password'
										fullWidth
										error={!!error}
										helperText={error?.message}
										disabled={isSubmitting}
									/>
								)}
							/>
						</Grid>

						<Grid item xs={12}>
							<Button
								type='submit'
								variant='contained'
								color='primary'
								fullWidth
								size='large'
								disabled={isSubmitting}
								startIcon={<PersonAddIcon />}
								sx={{
									py: 1.5,
									fontWeight: '700',
									fontSize: '1rem',
								}}
							>
								{isSubmitting ? 'Registering...' : 'Register'}
							</Button>
						</Grid>
                        <Grid item xs={12}>
                            <Typography variant="body2">
                                Already have an account? <Link component={RouterLink} to="/login">Sign In</Link>
                            </Typography>
                        </Grid>
					</Grid>
				</form>
			</Paper>
		</Container>
	);
}
