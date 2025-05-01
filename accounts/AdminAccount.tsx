import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import { supabase } from '../supabase'; // Adjust path as needed
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useNavigation } from '@react-navigation/native'; // Import the hook

const AdminAccount = () => {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const navigation = useNavigation(); // Get the navigation object
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
    });

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);
            setEmail(currentUser?.email || '');
            setLoading(false);
        };

        fetchUserData();
    }, []);

    const handleUpdateEmail = async () => {
        setUpdateLoading(true);
        const { data, error } = await supabase.auth.updateUser({ email });
        if (error) {
            Alert.alert('Error', `Failed to update email: ${error.message}`);
        } else {
            Alert.alert('Success', 'Email updated successfully!');
            setUser(data?.user);
        }
        setUpdateLoading(false);
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) {
            Alert.alert('Warning', 'Please enter a new password.');
            return;
        }
        setUpdateLoading(true);
        const { data, error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            Alert.alert('Error', `Failed to update password: ${error.message}`);
        } else {
            Alert.alert('Success', 'Password updated successfully!');
            setNewPassword(''); // Clear the password field
        }
        setUpdateLoading(false);
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to logout.');
        } else {
            // Navigate the user back to the login screen or appropriate place
            navigation.navigate('Auth'); // Now you can use the navigation object
            console.log('Logged out successfully');
        }
    };

    if (!fontsLoaded || loading) {
        return (
            <View style={styles.container}>
                <Text>Loading account information...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Account Information</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Button
                    title={updateLoading ? 'Updating...' : 'Update Email'}
                    onPress={handleUpdateEmail}
                    disabled={updateLoading}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password:</Text>
                <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Enter new password"
                />
                <Button
                    title={updateLoading ? 'Updating...' : 'Update Password'}
                    onPress={handleUpdatePassword}
                    disabled={updateLoading}
                />
            </View>

            <Button title="Logout" onPress={handleLogout} style={styles.logoutButton} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e293b',
        fontFamily: 'Inter_700Bold', // Assuming you have this font loaded
    },
    inputContainer: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#374151',
        fontFamily: 'Inter_600SemiBold',
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        backgroundColor: '#fff',
        marginBottom: 10,
        fontFamily: 'Inter_400Regular',
    },
    logoutButton: {
        marginTop: 30,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        paddingVertical: 12,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inter_600SemiBold',
    },
});

export default AdminAccount;