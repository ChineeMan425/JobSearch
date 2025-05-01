import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { supabase } from '../supabase';
import { useSession } from '../utils/sessionContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import JobForm from './JobForm';
import { RootStackParamList } from '../types/navigation'; // Import your route params type

interface Job {
    id: number;
    title: string;
    location: string | null;
    posted_date: string;
    created_by: string;
    // Add other properties based on your 'jobs' table schema
}

const CompanyJobsScreen = () => {
    let [fontsLoaded] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
    });
    const { session } = useSession();
    const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isJobFormVisible, setIsJobFormVisible] = useState<boolean>(false);
    useNavigation<NavigationProp<RootStackParamList>>();
// Use the correct type

    useEffect(() => {
        const fetchCompanyJobs = async () => {
            if (session?.user?.id) {
                setLoading(true);
                try {
                    const { data, error } = await supabase
                        .from('jobs')
                        .select('*')
                        .eq('created_by', session.user.id)
                        .order('posted_date', { ascending: false });

                    if (error) {
                        console.error('Error fetching company jobs:', error);
                        Alert.alert('Error', 'Failed to load your job postings.');
                    } else if (data) {
                        setCompanyJobs(data as Job[]); // Type assertion as 'data' should be Job[]
                    }
                } catch (error: any) {
                    console.error('An unexpected error occurred:', error);
                    Alert.alert('Error', 'An unexpected error occurred while loading jobs.');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchCompanyJobs().then();
    }, [session, isJobFormVisible]);

    const handleAddJobPress = () => {
        setIsJobFormVisible(true);
    };

    const handleJobFormSubmit = () => {
        // When a new job is created successfully, the fetchCompanyJobs effect will re-run
        setIsJobFormVisible(false);
    };

    const handleJobFormClose = () => {
        setIsJobFormVisible(false);
    };

    const renderJobItem = ({ item }: { item: Job }) => (
        <TouchableOpacity style={styles.jobItem}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobLocation}>{item.location || 'No location specified'}</Text>
            <Text style={styles.jobDate}>Posted: {new Date(item.posted_date).toLocaleDateString()}</Text>
            {/* Add more details here as needed */}
        </TouchableOpacity>
    );

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Job Postings</Text>
            {loading ? (
                <Text>Loading job postings...</Text>
            ) : companyJobs.length === 0 ? (
                <Text>You haven't posted any jobs yet.</Text>
            ) : (
                <FlatList
                    data={companyJobs}
                    keyExtractor={(item) => String(item.id)} // Ensure keyExtractor returns a string
                    renderItem={renderJobItem}
                    style={styles.list}
                />
            )}
            <TouchableOpacity
                style={styles.addJobButton}
                onPress={handleAddJobPress}
            >
                <Text style={styles.addJobButtonText}>Post a New Job</Text>
            </TouchableOpacity>

            <JobForm
                visible={isJobFormVisible}
                onClose={handleJobFormClose}
                onSubmit={handleJobFormSubmit} initialJob={undefined}            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f4f4f4',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#ff9800',
        fontFamily: 'Inter_600SemiBold',
        textAlign: 'center',
    },
    list: {
        flex: 1,
        marginTop: 10,
    },
    jobItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Inter_600SemiBold',
    },
    jobLocation: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Inter_400Regular',
        marginTop: 5,
    },
    jobDate: {
        fontSize: 14,
        color: '#888',
        fontFamily: 'Inter_400Regular',
        marginTop: 5,
    },
    addJobButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    addJobButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Inter_600SemiBold',
    },
});

export default CompanyJobsScreen;