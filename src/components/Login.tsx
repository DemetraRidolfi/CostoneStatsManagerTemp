import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      setError('');
      navigate('/'); // Redirect to home page after successful login
    } else {
      setError('Credenziali non valide');
    }
  };

  return (
    <div className="min-h-screen bg-green-50/50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://i.ibb.co/Pxsjh0j/costone.png"
            alt="Costone Logo"
            className="w-24 h-24 mx-auto rounded-full border-2 border-primary-600 shadow-lg mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            COSTONE BASKET SIENA
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Statistiche & Analisi Schemi
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-6">
            <KeyRound className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Accesso</h2>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 dark:focus:border-primary-400 focus:ring focus:ring-primary-200 dark:focus:ring-primary-900"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Accedi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}