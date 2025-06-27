import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Lock, User } from 'lucide-react';

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Get the return URL from location state or default to home
  const returnTo = location.state?.returnTo || '/';

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      
      if (user) {
        // If user is logged in, redirect to the return URL
        navigate(returnTo);
      }
    };
    
    checkUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Create user profile if it doesn't exist
          createUserProfile(session.user.id);
          
          // Redirect to the return URL
          navigate(returnTo);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, returnTo]);
  
  // Function to create user profile if it doesn't exist
  const createUserProfile = async (userId: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (!existingProfile) {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({ id: userId });
        
        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error checking/creating user profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Stylist</h1>
          <p className="text-gray-600">Sign in to save your designs and place orders</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#9333ea', // primary-600
                    brandAccent: '#7c3aed', // primary-700
                  },
                },
              },
              style: {
                button: {
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                },
                input: {
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem',
                },
              },
            }}
            providers={['google', 'facebook']}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;