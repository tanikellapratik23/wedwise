// This script helps you decode your JWT token to see if you have admin access
// Run this in your browser console after logging in

const token = localStorage.getItem('token');
if (token) {
  try {
    const parts = token.split('.');
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    console.log('Your JWT Token Details:');
    console.log('userId:', decoded.userId);
    console.log('isAdmin:', decoded.isAdmin);
    console.log('Full payload:', decoded);
  } catch (e) {
    console.error('Could not decode token:', e);
  }
} else {
  console.log('No token found in localStorage');
}
