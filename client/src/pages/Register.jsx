import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [role, setRole] = useState('admin');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await register(username, email, password, role);
        if (!res.success) {
            setError(res.error);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Get started with Easy Billing</p>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Register as</label>
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
                        <label>Username</label>
                        <input
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
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
                    <button type="submit" className="btn btn-primary w-full">Register</button>
                </form>
                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
