import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { supabase } from '../supabase';
import { useSession } from '../utils/sessionContext';
import { useNavigation } from '@react-navigation/native';

const CompanyAccountScreen = () => {
    const [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
    });
    const { session, setSession } = useSession();
    const [companyName, setCompanyName] = useState('');
    const [contactPhone, setContactPhone] = useState('1112223333'); // Hardcoded value
    const [website, setWebsite] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [errors, setErrors] = useState({
        companyName: '',
        contactPhone: '',
        website: '',
        email: '',
    });

    useEffect(() => {
        let isMounted = true;

        const fetchCompanyInfo = async () => {
            if (session?.user?.id && isMounted) {
                console.log('Fetching company info for user ID:', session.user.id);
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('company_name, website, contact_phone')
                        .eq('id', session.user.id)
                        .single();

                    if (error) {
                        console.error('Error fetching company info:', error);
                        if (isMounted) {
                            Alert.alert('Error', 'Failed to fetch account information.');
                        }
                    } else if (data) {
                        console.log('Fetched data:', data);
                        if (isMounted) {
                            setCompanyName(data.company_name || '');
                            setWebsite(data.website || '');
                            setContactPhone(data.contact_phone || '');
                            setEmail(session.user.email || '');
                        }
                    }
                } catch (error) {
                    console.error('An unexpected error occurred:', error);
                    if (isMounted) {
                        Alert.alert('Error', 'An unexpected error occurred while fetching info.');
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            }
        };

        if (session?.user?.id) {
            fetchCompanyInfo();
        }

        return () => {
            isMounted = false;
        };
    }, [session]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateWebsite = (website) => {
        if (!website) return true;
        const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i;
        return urlRegex.test(website);
    };

    const handleSaveChanges = async () => {
        let isValid = true;
        const newErrors = { companyName: '', contactPhone: '', website: '', email: '' };

        if (!companyName.trim()) {
            newErrors.companyName = 'Company name is required.';
            isValid = false;
        }

        if (!contactPhone.trim()) {
            newErrors.contactPhone = 'Contact number is required.';
            isValid = false;
        } else if (isNaN(contactPhone)) {
            newErrors.contactPhone = 'Contact number must be a valid number.';
            isValid = false;
        } else if (contactPhone.length < 7) {
            newErrors.contactPhone = 'Contact number must be at least 7 digits long.';
            isValid = false;
        }

        if (!validateWebsite(website)) {
            newErrors.website = 'Website URL is invalid.';
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required.';
            isValid = false;
        } else if (!validateEmail(email)) {
            newErrors.email = 'Email address is invalid.';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            if (!session?.user?.id) {
                Alert.alert('Error', 'No user session found.');
                return;
            }

            setLoading(true);
            let updateError = null;

            if (email !== session.user.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email });
                if (emailError) {
                    console.error('Error updating email:', emailError);
                    updateError = 'Failed to update email.';
                }
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .update({ company_name: companyName, website: website, contact_phone: contactPhone })
                .eq('id', session.user.id);

            if (profileError) {
                console.error('Error updating profile info:', profileError);
                updateError = updateError ? `${updateError}\nFailed to update profile information.` : 'Failed to update profile information.';
            }

            setLoading(false);

            if (updateError) {
                Alert.alert('Error', updateError);
            } else {
                Alert.alert('Success', 'Account information updated successfully!');
            }
        } else {
            Alert.alert('Validation Error', 'Please correct the invalid fields.');
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out.');
        } else {
            console.log('User signed out successfully.');
            setSession(null);
            navigation.navigate('Auth');
        }
        setLoading(false);
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }
    console.log('contactPhone state before render:', contactPhone);
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Edit Company Account</Text>

            <Text style={styles.label}>Email:</Text>
            <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.label}>Company Name:</Text>
            <TextInput
                style={[styles.input, errors.companyName && styles.inputError]}
                placeholder="Company Name"
                value={companyName}
                onChangeText={setCompanyName}
            />
            {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}

            <Text style={styles.label}>Website:</Text>
            <TextInput
                style={[styles.input, errors.website && styles.inputError]}
                placeholder="Website"
                value={website}
                onChangeText={setWebsite}
                keyboardType="url"
            />
            {errors.website && <Text style={styles.errorText}>{errors.website}</Text>}

            <Text style={styles.label}>Contact Number:</Text>
            <TextInput
                style={[styles.input, errors.contactPhone && styles.inputError]}
                placeholder="Contact Number"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="number-pad"
            />
            {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loading}>
                <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
                <Text style={styles.logoutButtonText}>{loading ? 'Logging Out...' : 'Logout'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#ff9800',
        fontFamily: 'Inter_700Bold',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        fontFamily: 'Inter_600SemiBold',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        fontFamily: 'Inter_400Regular',
    },
    saveButton: {
        backgroundColor: '#ff9800',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Inter_600SemiBold',
    },
    logoutButton: {
        backgroundColor: '#dc3545', // Example red color for logout
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Inter_600SemiBold',
    },
});

export default CompanyAccountScreen;