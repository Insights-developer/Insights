'use client';

import { useState, FormEvent } from 'react';
import Button from '@/app/components/ui/Buttons';
import Card from '@/app/components/ui/Cards';
import { resetPassword, requestPasswordReset } from '@/utils/auth';
import Link from 'next/link';

type ResetFormState = 'initial' | 'requested' | 'submitting' | 'success' | 'error';

// This component can be used as part of the migration process
// to help users create new passwords after migration
export default function MigrationPasswordReset() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formState, setFormState] = useState<ResetFormState>('initial');
  const [error, setError] = useState('');

  // Request a password reset token
  const handleRequestReset = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setFormState('submitting');
      await requestPasswordReset(email);
      setFormState('requested');
      setError('');
    } catch (err) {
      console.error('Error requesting password reset:', err);
      setError('Failed to request password reset. Please try again.');
      setFormState('error');
    }
  };

  // Submit the new password with token
  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please enter the reset token from your email');
      return;
    }
    
    if (!password) {
      setError('Please enter a new password');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setFormState('submitting');
      await resetPassword(token, password);
      setFormState('success');
      setError('');
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Failed to reset password. Please check your token and try again.');
      setFormState('error');
    }
  };

  // Render the initial request form
  const renderRequestForm = () => (
    <form onSubmit={handleRequestReset} className="space-y-4">
      <div>
        <h3 className="text-xl font-medium mb-2">
          Reset Your Password
        </h3>
        <p className="text-gray-600 mb-4">
          We've updated our authentication system. Please reset your password to continue.
        </p>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div>
        <Button 
          color="primary" 
          disabled={formState === 'submitting'}
          className="w-full"
        >
          {formState === 'submitting' ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </div>
    </form>
  );

  // Render the form to enter reset token and new password
  const renderResetForm = () => (
    <form onSubmit={handleResetSubmit} className="space-y-4">
      <div>
        <h3 className="text-xl font-medium mb-2">
          Set New Password
        </h3>
        <p className="text-gray-600 mb-4">
          Enter the reset token from your email and choose a new password.
        </p>
      </div>
      
      <div>
        <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
          Reset Token
        </label>
        <input
          id="token"
          type="text"
          value={token}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value)}
          placeholder="Enter token from email"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div>
        <Button 
          color="primary" 
          disabled={formState === 'submitting'}
          className="w-full"
        >
          {formState === 'submitting' ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>
      
      <div className="text-center">
        <button
          type="button"
          onClick={() => setFormState('initial')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Back to reset request
        </button>
      </div>
    </form>
  );

  // Render success message
  const renderSuccess = () => (
    <Card className="p-6 border border-green-200 bg-green-50">
      <h3 className="text-xl font-medium text-green-800 mb-2">
        Password Reset Successful!
      </h3>
      <p className="text-green-700 mb-4">
        Your password has been updated successfully.
      </p>
      <Link href="/login" className="text-green-800 font-medium hover:text-green-900">
        Return to Login
      </Link>
    </Card>
  );

  // Render the email sent confirmation
  const renderRequestedState = () => (
    <Card className="p-6 border border-blue-200 bg-blue-50">
      <h3 className="text-xl font-medium text-blue-800 mb-2">
        Check Your Email
      </h3>
      <p className="text-blue-700 mb-4">
        We've sent a password reset token to {email}. Please check your inbox and spam folder.
      </p>
      <Button 
        color="secondary" 
        onClick={() => setFormState('requested')} 
        className="mr-4"
      >
        I Have My Token
      </Button>
      <button
        type="button"
        onClick={() => setFormState('initial')}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Use Different Email
      </button>
    </Card>
  );

  // Main component render based on form state
  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      {formState === 'initial' && renderRequestForm()}
      {formState === 'requested' && renderRequestedState()}
      {formState === 'error' && renderRequestForm()}
      {formState === 'success' && renderSuccess()}
    </div>
  );
}
