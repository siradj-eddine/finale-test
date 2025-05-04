

// utils/auth.js
export const checkAuth = () => {
    // Check if user is authenticated (you might use localStorage, cookies, or context)
    return localStorage.getItem('isAuthenticated') === 'true';
    // Or use your authentication context if you have one
  };
  
  export const requireAuth = (navigate, from = '/') => {
    if (!checkAuth()) {
      navigate('/login', { state: { from } });
      return false;
    }
    return true;
  };

// import { createContext, useContext, useEffect, useState } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);

//   // Add this function
//   const checkAuth = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/api/me', {
//         withCredentials: true
//       });
//       setCurrentUser(response.data.user);
//     // eslint-disable-next-line no-unused-vars
//     } catch (error) {
//       setCurrentUser(null);
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post('/logout', {}, { withCredentials: true });
//       setCurrentUser(null);
//       localStorage.removeItem('guestCart');
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   // Single return statement
//   return (
//     <AuthContext.Provider value={{ currentUser, checkAuth, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
// export default AuthProvider;

