import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/Login';
import AdminScreen from './screens/Admin';
import UserScreen from "./screens/User";
import CompanyScreen from "./screens/Company";
import { supabase } from './supabase';
import { View, Text, StyleSheet, TouchableWithoutFeedback, AppState } from 'react-native'; // Import AppState
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { signOut as signOutService } from './services/authService';
import { SessionProvider } from './utils/sessionContext';
import { Session } from '@supabase/supabase-js';

const Stack = createNativeStackNavigator();
const INACTIVITY_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const App = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState(null);
    const [loadingRole, setLoadingRole] = useState(true);
    const [loadingSession, setLoadingSession] = useState(true);
    const [lastActive, setLastActive] = useState(Date.now());
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    useEffect(() => {
        let isMounted = true;

        const getInitialSession = async () => {
            setLoadingSession(true);
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (isMounted) {
                setSession(currentSession);
                setLoadingSession(false);
            }
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, currentSession) => {
                if (isMounted) {
                    setSession(currentSession);
                }
                if (currentSession?.user?.id) {
                    await fetchUserRole(currentSession.user.id);
                } else {
                    setUserRole(null);
                    setLoadingRole(false);
                }
            }
        );

        const fetchUserRole = async (userId) => {
            if (userId) {
                setLoadingRole(true);
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('roles(name)')
                        .eq('id', userId)
                        .single();

                    if (error) {
                        console.error("Error fetching user role", error);
                        setUserRole(null);
                    } else {
                        setUserRole(data?.roles?.name);
                    }
                } catch (error) {
                    console.error("Error fetching user role", error);
                    setUserRole(null);
                } finally {
                    setLoadingRole(false);
                }
            } else {
                setUserRole(null);
                setLoadingRole(false);
            }
        };

        if (session?.user?.id) {
            fetchUserRole(session.user.id);
        }

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        let appStateSubscription = null;

        const handleAppStateChange = async (nextAppState) => {
            if (session?.user && (nextAppState === 'background' || nextAppState === 'inactive')) {
                console.log('App going to background/inactive, signing out...');
                const { error } = await signOutService();
                if (error) {
                    console.error('Error signing out on app close:', error);
                } else {
                    setSession(null);
                    console.log('Signed out successfully on app close.');
                }
            }
        };

        const subscribeAppState = () => {
            appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
        };

        const unsubscribeAppState = () => {
            if (appStateSubscription) {
                appStateSubscription.remove();
                appStateSubscription = null;
            }
        };

        subscribeAppState();

        return () => {
            unsubscribeAppState();
        };
    }, [session, setSession]);

    useEffect(() => {
        const checkInactivity = async () => {
            if (session?.user && (Date.now() - lastActive > INACTIVITY_TIMEOUT)) {
                console.log('User inactive for too long (7 days), signing out...');
                const { error } = await signOutService();
                if (error) {
                    console.error('Error signing out due to inactivity:', error);
                } else {
                    setSession(null);
                    console.log('Signed out due to inactivity.');
                }
            }
        };

        const intervalId = setInterval(checkInactivity, 60 * 60 * 1000); // Check every hour

        return () => clearInterval(intervalId);
    }, [lastActive, session, setSession]);

    const resetInactivityTimer = () => {
        setLastActive(Date.now());
    };

    if (loadingSession || !fontsLoaded || loadingRole) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <SessionProvider value={{ session, setSession, isLoadingSession: loadingSession }}>
            <NavigationContainer>
                <TouchableWithoutFeedback onPress={resetInactivityTimer} onMove={resetInactivityTimer} style={{ flex: 1 }}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {session?.user ? (
                            userRole === 'admin' ? (
                                <Stack.Screen name="Admin" component={AdminScreen} />
                            ) : userRole === 'company' ? (
                                <Stack.Screen name="Company" component={CompanyScreen} />
                            ) : (
                                <Stack.Screen name="User" component={UserScreen} />
                            )
                        ) : (
                            <Stack.Screen name="Auth" component={LoginScreen} />
                        )}
                    </Stack.Navigator>
                </TouchableWithoutFeedback>
            </NavigationContainer>
        </SessionProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
});

export default App;