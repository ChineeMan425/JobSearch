// ./services/authService.ts
import { supabase } from '../supabase';
import { AuthResponse, AuthError, Session } from '@supabase/supabase-js';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation'; // Adjust path

// Define a type for your navigation object
type AuthNavigation = StackNavigationProp<RootStackParamList>;

let navigation: AuthNavigation | null = null;

// Function to set the navigation object from your component
export const setAuthNavigation = (nav: AuthNavigation) => {
    navigation = nav;
};

// Function to check initial session
export const checkInitialSession = async (): Promise<Session | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && navigation) {
        navigation.navigate('Auth'); // Navigate to your login screen
    }
    return session;
};

// Function to handle auth state changes
export const onAuthStateChangeHandler = (
    callback: (_event: any, session: Session | null) => void
): { data: { subscription: { unsubscribe: () => void } } } => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(_event, session);
        if (!session && navigation) {
            navigation.navigate('Auth'); // Navigate to your login screen
        }
    });
    return { data: { subscription } };
};

interface SignUpResult {
    data?: AuthResponse['data']['user'] | null;
    error?: AuthError | { message: string } | null;
}

interface SignInResult {
    error?: AuthError | null;
    data?: AuthResponse['data']['session'] | null; // Include session data (important for the fix)
}

interface SignOutResult {
    error?: AuthError | null;
}

export const signUp = async (
    email: string,
    password: string,
    fullName: string,
    username: string,
    role: 'user' | 'company',
    companyName?: string
): Promise<SignUpResult> => {
    try {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: 'http://localhost:3000',
            },
        });

        if (signUpError) {
            return { error: signUpError };
        }

        if (user?.id) {
            const { data: selectedRole, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('name', role)
                .single();

            if (roleError) {
                console.error('Error fetching role:', roleError);
                return { error: { message: 'Failed to fetch user role.' } };
            }

            if (!selectedRole?.id) {
                console.error('Role not found');
                return { error: { message: 'Role not found in database.' } };
            }
            const selectedRoleId: number = selectedRole.id;

            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: user.id,
                        username,
                        full_name: fullName,
                        role_id: selectedRoleId,
                        company_name: role === 'company' ? companyName : null,
                    },
                ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                await supabase.auth.signOut();
                return { error: { message: 'Failed to create user profile. Your account was created, but profile creation failed.' } };
            }
        }
        return { data: user };
    } catch (error: any) {
        console.error('Authentication Error:', error);
        return { error: { message: 'An unexpected error occurred during sign up.' } };
    }
};

export const signIn = async (email: string, password: string): Promise<SignInResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { error, data }; // Return both error and data (important for the fix)
};

export const signOut = async (): Promise<SignOutResult> => {
    const { error } = await supabase.auth.signOut();
    if (!error && navigation) {
        navigation.navigate('Auth');
    }
    return { error };
};