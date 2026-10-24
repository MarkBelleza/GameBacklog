import { useState } from 'react'
import '../css/Register.css';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        try {
            await registerUser(username, email, password);
            setSuccess('Registration successful! Redirecting to login...');
            setPassword('');

            // Go to the login page after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 1500); // 1.5 seconds delay
        } catch (error) {
            setError(error.message || 'Registration failed. Please try again.');
        }

    }

    return (
        <div className="auth-page">
            <h2>Create an Account</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}
                <button type="submit">Register</button>
            </form>
        </div>
    );

}

export default Register;