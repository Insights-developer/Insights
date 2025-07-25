// Helper script to make an auth token for local development
// Run with: node scripts/create-dev-auth.js

const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = 'dev@example.com';
const password = 'development123';

async function main() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase configuration. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // First try to sign in
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error && error.message.includes('Invalid login credentials')) {
    console.log('User does not exist, creating development user...');
    
    // User doesn't exist, create one
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Development User',
          role: 'admin'
        }
      }
    });
    
    if (result.error) {
      console.error('Failed to create user:', result.error);
      process.exit(1);
    }
    
    data = result.data;
    console.log('Created development user successfully');
  } else if (error) {
    console.error('Login failed:', error);
    process.exit(1);
  } else {
    console.log('Logged in with existing development user');
  }

  console.log('Authentication successful!');
  console.log('-----------------------------------------------');
  console.log('User ID:', data.user?.id);
  console.log('Auth Token (for cookies):', data.session?.access_token);
  console.log('-----------------------------------------------');
  console.log('Add this token to your browser cookies as "sb-access-token" and "sb-refresh-token" for the domain');
}

main().catch(console.error);
