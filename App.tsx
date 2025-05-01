import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/Login';
import AdminScreen from './screens/Admin';
import { View, Text, StyleSheet, AppState, AppStateStatus, NativeEventSubscription } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { signOut as signOutService } from './services/authService';
import { SessionProvider } from './utils/sessionContext';
import { Session } from '@supabase/supabase-js';
import BottomTabNavigator from './types/BottomTabNavigator';
import { RootStackParamList } from './types/navigation';
import CompanyScreen from "./screens/Company";
import {supabase} from "./supabase";

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'company' | null>(null);
    const [loadingRole, setLoadingRole] = useState<boolean>(true);
    const [loadingSession, setLoadingSession] = useState<boolean>(true);
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

        const fetchUserRole = async (userId: string) => {
            if (userId) {
                setLoadingRole(true);
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('roles(name)')
                        .eq('id', userId)
                        .single()
                        .returns<{ roles: { name: 'admin' | 'company' } } | null>();

                    if (error) {
                        console.error("Error fetching user role", error);
                        setUserRole(null);
                    } else {
                        setUserRole(data?.roles?.name || null);
                    }
                } catch (error: any) {
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
        let appStateSubscription: NativeEventSubscription | null = null;

        const handleAppStateChange = async (nextAppState: AppStateStatus) => {
            if (session?.user && (nextAppState === 'background' || nextAppState === 'inactive')) {
                console.log('App going to background/inactive');
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
            appStateSubscription = AppState.addEventListener('change', handleAppStateChange) as NativeEventSubscription;
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
                <View style={{ flex: 1 }}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {session?.user ? (
                            userRole === 'admin' ? (
                                <Stack.Screen name="Admin" component={AdminScreen} />
                            ) : userRole === 'company' ? (
                                <Stack.Screen name="Company" component={CompanyScreen} />
                            ) : (
                                <Stack.Screen name="Main" component={BottomTabNavigator} />
                            )
                        ) : (
                            <Stack.Screen name="Auth" component={LoginScreen} />
                        )}
                    </Stack.Navigator>
                </View>
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