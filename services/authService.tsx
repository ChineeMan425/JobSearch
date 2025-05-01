import { supabase } from '../supabase';
import { AuthResponse, AuthError } from '@supabase/supabase-js';

interface SignUpResult {
    data?: AuthResponse['data']['user'] | null;
    error?: AuthError | { message: string } | null;
}

interface SignInResult {
    error?: AuthError | null;
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
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { error };
};

export const signOut = async (): Promise<SignOutResult> => {
    const { error } = await supabase.auth.signOut();
    return { error };
};