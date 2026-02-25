import React, { useState } from 'react';
import axios from 'axios';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress, Box
} from '@mui/material';

// The API URL for your central login endpoint
const API_URL = "http://localhost:5000/api";

interface AdminLoginProps {
  open: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ open, onClose, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // 1. Call the SAME login endpoint as the homepage
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: email,
        password: password,
      });

      const { user } = response.data;

      // 2. Check if the logged-in user has the 'admin' role
      if (user && user.role === 'admin') {
        // 3. If they are an admin, call the onLogin callback with their username
        onLogin(user.username);
        // Clear fields and close the dialog on success
        setEmail('');
        setPassword('');
        onClose(); 
      } else {
        // If they are a valid user but NOT an admin
        setError('Access denied. Administrator privileges required.');
      }
    } catch (err: any) {
      // If the API returns an error (e.g., 401 for wrong credentials)
      setError(err.response?.data?.msg || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state when closing the dialog
    setEmail('');
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Admin Authentication</DialogTitle>
      <DialogContent>
        <p style={{ margin: '0 0 20px 0', color: '#666' }}>
          Please re-enter your credentials to approve entries.
        </p>
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="Admin Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <TextField
          margin="dense"
          id="password"
          label="Password"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Box sx={{ position: 'relative' }}>
          <Button 
            onClick={handleLogin} 
            variant="contained" 
            disabled={loading}
          >
            Authenticate
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AdminLogin;