import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for saved token
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password, role) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            navigate(data?.role === 'worker' ? '/worker/dashboard' : '/dashboard');
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const register = async (username, email, password, role) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, role }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Registration failed');

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            navigate(data?.role === 'worker' ? '/worker/dashboard' : '/dashboard');
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
