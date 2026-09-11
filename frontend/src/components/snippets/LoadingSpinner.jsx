import { Box, CircularProgress } from '@mui/material';

export default function LoadingSpinner({ small = false }) {
	if (small) {
		return <CircularProgress size={20} sx={{ color: 'primary.main' }} />;
	}

	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
			{/* The container needs relative positioning so the children overlap within its boundaries */}
			<Box sx={{ display: 'flex', position: 'relative', width: 40, height: 40 }}>
				<CircularProgress sx={{ color: 'primary.main', position: 'absolute', top: 0, left: 0 }} size={40} />
				<CircularProgress sx={{ color: 'secondary.main', position: 'absolute', top: 0, left: 25 }} size={40} />
				<CircularProgress sx={{ color: 'primary.light', position: 'absolute', top: 0, left: 50 }} size={40} />
			</Box>
		</Box>
	);
}
