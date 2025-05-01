import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { signUp as signUpService, signIn as signInService } from '../services/authService';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('regular_user');
    const [companyName, setCompanyName] = useState('');
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const handleAuth = async () => {
        setLoading(true);
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                // --- Sign Up ---
                if (!fullName || !username) {
                    Alert.alert('Error', 'Please enter full name and username for sign up.');
                    setLoading(false);
                    return;
                }

                if (role === 'company' && !companyName) {
                    Alert.alert('Error', 'Please enter company name for company sign up.');
                    setLoading(false);
                    return;
                }

                const signUpResult = await signUpService(email, password, fullName, username, role, companyName);

                if (signUpResult?.error) {
                    console.error('Sign Up Error:', signUpResult.error);
                    Alert.alert('Sign Up Failed', signUpResult.error.message);
                    setLoading(false);
                    return;
                }

                Alert.alert('Sign Up Successful', 'Your account has been created!');
                setIsSignUp(false);
                setEmail('');
                setPassword('');
                setFullName('');
                setUsername('');
                setRole('regular_user');
                setCompanyName('');

            } else {
                // --- Sign In ---
                const signInError = await signInService(email, password);

                if (signInError?.error) {
                    console.error('Sign In Error:', signInError.error);
                    Alert.alert('Sign In Failed', signInError.error.message);
                    setLoading(false);
                    return;
                }
                // No need to navigate here, App.js auth state listener will handle it
            }
        } catch (error) {
            console.error('Authentication Error:', error);
            Alert.alert('Authentication Error', 'An unexpected error occurred.');
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>

            {/* Input fields  */}
            {isSignUp && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
                    {/* Conditionally render Company Name */}
                    {role === 'company' && (
                        <TextInput
                            style={styles.input}
                            placeholder="Company Name"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    )}
                </>
            )}

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {/* Conditional rendering of buttons */}
            {!isSignUp && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleAuth}
                        disabled={loading}
                        style={styles.signInButton}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                    <View style={styles.sideBySideButtons}>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSignUp(true);
                                setRole('regular_user');
                            }}
                            style={styles.userSignUpButton}
                        >
                            <Text style={styles.signUpButtonText}>User Sign Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSignUp(true);
                                setRole('company');
                            }}
                            style={styles.companySignUpButton}
                        >
                            <Text style={styles.signUpButtonText}>Company Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {isSignUp && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        onPress={handleAuth}
                        disabled={loading}
                        style={styles.signUpButton}
                    >
                        <Text style={styles.signUpButtonText}>Sign Up</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setIsSignUp(false);
                            setRole('regular_user');
                            setCompanyName('');
                        }}
                        disabled={loading}
                        style={styles.signInButton}
                    >
                        <Text style={styles.signInButtonText}>Already have an account? Sign In</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#1e293b',
        fontFamily: 'Inter_700Bold',
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        backgroundColor: '#fff',
        color: '#1e293b',
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 20,
    },
    signInButton: {
        marginTop: 10,
        width: '100%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#3b82f6',
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    userSignUpButton: {
        marginBottom: 0,
        width: '48%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#10b981',
        marginRight: '2%',
    },
    companySignUpButton: {
        marginBottom: 0,
        width: '48%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        marginLeft: '2%',
    },
    signUpButton: {
        marginTop: 10,
        width: '100%',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#10b981',
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Inter_600SemiBold',
    },
    sideBySideButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
});

export default LoginScreen;