import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Insights App',
  description: 'Reset your password to access your account',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {children}
      </div>
    </div>
  );
}
