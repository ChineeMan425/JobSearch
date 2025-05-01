import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { supabase } from '../supabase';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { Card } from 'react-native-paper';
import JobForm from './JobForm'; // Ensure the path to JobForm is correct

const JobsScreen = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateJobModalVisible, setIsCreateJobModalVisible] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    let [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_400Regular,
    });

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select(`
                *,
                categories!fk_jobs_category (
                    name
                ),
                profiles (
                    company_name
                )
            `);

                if (jobsError) {
                    console.error('Error fetching jobs:', jobsError);
                    Alert.alert('Error', 'Failed to fetch jobs.');
                    return;
                }
                setJobs(jobsData || []);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleDeleteJob = async (jobId) => {
        try {
            setLoading(true);
            const { error: deleteError } = await supabase
                .from('jobs')
                .delete()
                .eq('id', jobId);

            if (deleteError) {
                console.error('Error deleting job:', deleteError);
                Alert.alert('Error', 'Failed to delete job.');
            } else {
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
                Alert.alert('Success', 'Job deleted successfully.');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJobPress = () => {
        setEditingJob(null);
        setIsCreateJobModalVisible(true);
    };

    const handleEditJob = (job) => {
        setEditingJob(job);
        setIsCreateJobModalVisible(true);
    };

    const handleJobCreatedOrUpdated = (newOrUpdatedJobData) => {
        // This function is called after a job is created or updated in JobForm
        fetchJobs(); // Refresh the job list
        setIsCreateJobModalVisible(false);
        setEditingJob(null);
    };

    const handleJobFormCancel = () => {
        setIsCreateJobModalVisible(false);
        setEditingJob(null);
    };

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { flex: 1 }]}>
            <Text style={styles.title}>Jobs</Text>
            <Button
                title="Create New Job"
                onPress={handleCreateJobPress}
                buttonStyle={styles.createButton}
                titleStyle={styles.buttonText}
                containerStyle={{ marginBottom: 15 }}
                disabled={loading}
            />

            <JobForm
                visible={isCreateJobModalVisible}
                onClose={handleJobFormCancel}
                onSubmit={handleJobCreatedOrUpdated}
                initialJob={editingJob}
            />

            {loading ? ( <Text>Loading jobs...</Text>) : jobs.length === 0 ? (
                <Text>No jobs found.</Text>
            ) : (
                jobs.map(job => (
                    <Card key={job.id} style={styles.jobCard}>
                        <Card.Content>
                            <View style={styles.jobInfo}>
                                <Text style={styles.jobTitle}>{job.title || ''}</Text>
                                <Text style={styles.jobCompany}>Company: {job.profiles?.company_name || 'N/A'}</Text>
                                <Text style={styles.jobCategory}>Category: {job.categories?.name || 'N/A'}</Text>
                                <Text style={styles.jobMeta}>
                                    {job.location ? `${job.location} - ` : ''}
                                    {job.job_type ? `(${job.job_type}) - ` : ''}
                                    {job.application_deadline ? `Deadline: ${job.application_deadline}` : ''}
                                </Text>
                            </View>
                            {/* You can add a Button here to select the job post for more details */}
                            {/* <Button title="View Details" onPress={() => /* Handle job selection */ } /> */}
                        </Card.Content>
                    </Card>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // ... other styles ...
    jobTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        fontFamily: 'Inter_600SemiBold',
        marginBottom: 8,
    },
    jobCompany: {
        fontSize: 14,
        color: '#4b5563',
        fontFamily: 'Inter_400Regular',
        marginBottom: 5,
    },
    jobCategory: {
        fontSize: 14,
        color: '#4b5563',
        fontFamily: 'Inter_400Regular',
        marginBottom: 5,
    },
    jobMeta: {
        fontSize: 12,
        color: '#717171',
        fontFamily: 'Inter_400Regular',
        marginBottom: 5,
    },
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
        fontFamily: 'Inter_700Bold',
    },
    jobCard: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        fontFamily: 'Inter_600SemiBold',
    },
    jobCompany: {
        fontSize: 14,
        color: '#4b5563',
        fontFamily: 'Inter_400Regular',
        marginBottom: 5,
    },
    jobCategory: {
        fontSize: 14,
        color: '#4b5563',
        fontFamily: 'Inter_400Regular',
        marginBottom: 5,
    },
    jobDescription: {
        fontSize: 14,
        color: '#6b7280',
        fontFamily: 'Inter_400Regular',
        marginBottom: 10,
    },
    jobSalary: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
        fontFamily: 'Inter_600SemiBold',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    editButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    createButton: {
        backgroundColor: '#6366f1',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
});

export default JobsScreen;