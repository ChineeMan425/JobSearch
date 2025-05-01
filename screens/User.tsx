import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';

const UserScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState(null);

    let [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_400Regular,
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                Alert.alert('Login Error', error.message);
            }
        } catch (error) {
            Alert.alert('Unexpected Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                Alert.alert('Logout Error', error.message);
            }
        } catch (error) {
            Alert.alert('Unexpected Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Account</Text>

            {session ? (
                <View>
                    <Text style={styles.loggedInText}>You are logged in.</Text>
                    <Button
                        title={loading ? 'Logging Out...' : 'Logout'}
                        onPress={handleLogout}
                        disabled={loading}
                        buttonStyle={styles.logoutButton}
                        titleStyle={styles.buttonText}
                    />
                </View>
            ) : (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <Button
                        title={loading ? 'Logging In...' : 'Login'}
                        onPress={handleLogin}
                        disabled={loading}
                        buttonStyle={styles.loginButton}
                        titleStyle={styles.buttonText}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f4f8',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#1e293b',
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        backgroundColor: '#fff',
        fontFamily: 'Inter_400Regular',
    },
    loginButton: {
        backgroundColor: '#6366f1',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 10,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
    },
    loggedInText: {
        fontSize: 16,
        color: '#10b981',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default UserScreen;