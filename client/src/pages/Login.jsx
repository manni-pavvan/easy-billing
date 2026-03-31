import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [role, setRole] = useState('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password, role);
        if (!res.success) {
            setError(res.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to access your dashboard</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                {user && (
                    <div style={{ marginBottom: '1rem' }}>
                        <div className="alert-success">
                            You are already signed in as <b>{user.email}</b>{user.role ? <> ({user.role})</> : null}.
                        </div>
                        <button
                            type="button"
                            className="btn btn-secondary w-full"
                            onClick={() => navigate(user?.role === 'worker' ? '/worker/dashboard' : '/dashboard')}
                            style={{ marginTop: '0.75rem' }}
                        >
                            Continue to Dashboard
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Login as</label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setRole('admin')}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                className={`btn ${role === 'worker' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setRole('worker')}
                            >
                                Worker
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Sign In</button>
                </form>
                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
