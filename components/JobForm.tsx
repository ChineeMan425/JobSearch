import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Button } from 'react-native-elements';
import { supabase } from '../supabase';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { Picker } from '@react-native-picker/picker';
import CustomQuestions from './CustomQuestion'; // Import the new component

const JobForm = ({ visible, onClose, onSubmit, initialJob }) => {
    const [title, setTitle] = useState(initialJob?.title || '');
    const [location, setLocation] = useState(initialJob?.location || '');
    const [jobType, setJobType] = useState(initialJob?.job_type || '');
    const [applicationDeadline, setApplicationDeadline] = useState(initialJob?.application_deadline || '');
    const [requirements, setRequirements] = useState(initialJob?.requirements || '');
    const [company, setCompany] = useState(initialJob?.company || '');
    const [customQuestions, setCustomQuestions] = useState(initialJob?.custom_questions || []);
    const [salary, setSalary] = useState(initialJob?.salary?.toString() || '');
    const [categoryId, setCategoryId] = useState(initialJob?.category_id || '');
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [creatingNewCategory, setCreatingNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loadingNewCategory, setLoadingNewCategory] = useState(false);
    const [description, setDescription] = useState(initialJob?.description || '');
    const [showCustomQuestions, setShowCustomQuestions] = useState(initialJob?.custom_questions?.length > 0 || false);

    let [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_400Regular,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('id, name');
                if (error) {
                    console.error('Error fetching categories:', error);
                    Alert.alert('Error', 'Failed to fetch job categories.');
                    return;
                }
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                Alert.alert('Error', 'An unexpected error occurred while fetching categories.');
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialJob) {
            setTitle(initialJob.title || '');
            setLocation(initialJob.location || '');
            setJobType(initialJob.job_type || '');
            setApplicationDeadline(initialJob.application_deadline || '');
            setRequirements(initialJob.requirements || '');
            setCompany(initialJob.company || '');
            setCustomQuestions(initialJob.custom_questions || []);
            setSalary(String(initialJob.salary) || '');
            setCategoryId(initialJob.category_id || '');
            setDescription(initialJob.description || '');
            setShowCustomQuestions(initialJob.custom_questions?.length > 0 || false);
        } else {
            setTitle('');
            setLocation('');
            setJobType('');
            setApplicationDeadline('');
            setRequirements('');
            setCompany('');
            setCustomQuestions([]);
            setSalary('');
            setCategoryId('');
            setDescription('');
            setShowCustomQuestions(false);
        }
    }, [initialJob]);

    const handleCreateNewCategory = () => {
        setCreatingNewCategory(true);
        setCategoryId('new_category'); // Set a temporary value
    };

    const handleSaveNewCategory = async () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Validation Error', 'Category name cannot be empty.');
            return;
        }

        setLoadingNewCategory(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name: newCategoryName }])
                .single();

            if (error) {
                console.error('Error creating category:', error);
                Alert.alert('Error', 'Failed to create new category.');
            } else {
                Alert.alert('Success', `Category "${data.name}" created successfully.`);
                setNewCategoryName('');
                setCreatingNewCategory(false);
                // Refetch categories to update the picker
                const { data: updatedCategories, error: fetchError } = await supabase
                    .from('categories')
                    .select('id, name');
                if (fetchError) {
                    console.error('Error fetching updated categories:', fetchError);
                } else {
                    setCategories(updatedCategories);
                    setCategoryId(data.id); // Select the newly created category
                }
            }
        } catch (error) {
            console.error('Error creating category:', error);
            Alert.alert('Error', 'An unexpected error occurred while creating category.');
        } finally {
            setLoadingNewCategory(false);
        }
    };

    const handleAddQuestion = () => {
        setShowCustomQuestions(true);
        setCustomQuestions([...customQuestions, { question: '', answer: '' }]);
    };

    const handleRemoveQuestion = (index) => {
        const updatedQuestions = customQuestions.filter((_, i) => i !== index);
        setCustomQuestions(updatedQuestions);
    };

    const handleQuestionChange = (text, index) => {
        const updatedQuestions = customQuestions.map((item, i) =>
            i === index ? { ...item, question: text } : item
        );
        setCustomQuestions(updatedQuestions);
    };

    const handleAnswerChange = (text, index) => {
        const updatedQuestions = customQuestions.map((item, i) =>
            i === index ? { ...item, answer: text } : item
        );
        setCustomQuestions(updatedQuestions);
    };

    const handleSubmit = async () => {
        let errors = {};

        if (!title.trim()) {
            errors.title = 'Job title is required.';
        }
        if (!company.trim()) {
            errors.company = 'Company name is required.';
        }
        if (!description.trim()) {
            errors.description = 'Job description is required.';
        }
        if (salary && isNaN(parseInt(salary, 10))) {
            errors.salary = 'Salary must be a valid number.';
        }
        if (applicationDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(applicationDeadline)) {
            errors.applicationDeadline = 'Application deadline must be in<\ctrl3348>-MM-DD format.';
        }
        if (!categoryId) {
            errors.categoryId = 'Please select a job category.';
        } else if (categoryId === 'new_category' && !newCategoryName.trim()) {
            errors.categoryId = 'Please enter a name for the new category.';
        }
        if (!jobType) {
            errors.jobType = 'Please select a job type.';
        }

        if (Object.keys(errors).length > 0) {
            let errorMessage = Object.values(errors).join('\n');
            Alert.alert('Validation Error', errorMessage);
            return;
        }

        setLoadingSubmit(true);
        try {
            const finalCategoryId = creatingNewCategory ? null : categoryId;
            const formattedCustomQuestions = showCustomQuestions ? customQuestions.filter(q => q.question.trim() !== '') : [];

            const jobData = {
                title,
                location,
                job_type: jobType,
                application_deadline: applicationDeadline,
                company,
                description,
                requirements,
                category_id: finalCategoryId,
                custom_questions: formattedCustomQuestions.length > 0 ? formattedCustomQuestions : null,
                created_by: supabase.auth.user()?.id,
                salary: parseInt(salary, 10) || null,
            };

            if (initialJob) {
                const { data, error } = await supabase
                    .from('jobs')
                    .update(jobData)
                    .eq('id', initialJob.id);

                if (error) {
                    console.error('Error updating job:', error);
                    Alert.alert('Error', 'Failed to update job.');
                } else {
                    Alert.alert('Success', 'Job updated successfully.');
                    onSubmit(data);
                    onClose();
                }
            } else {
                const { data, error } = await supabase
                    .from('jobs')
                    .insert([jobData])
                    .single();

                if (error) {
                    console.error('Error creating job:', error);
                    Alert.alert('Error', 'Failed to create job.');
                } else {
                    Alert.alert('Success', 'Job created successfully.');
                    onSubmit(data);
                    onClose();
                }
            }
        } catch (error) {
            console.error('Error creating/updating job:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (!fontsLoaded || loadingCategories) {
        return (
            <View style={styles.modalContainer}>
                <Text>Loading categories...</Text>
            </View>
        );
    }

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <ScrollView
                style={styles.modalContainer}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: showCustomQuestions ? 250 : 150 }}
            >
                <Text style={styles.modalTitle}>{initialJob ? 'Edit Job' : 'Create New Job'}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Job Title"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Company Name"
                    value={company}
                    onChangeText={setCompany}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Location"
                    value={location}
                    onChangeText={setLocation}
                />
                <Picker
                    selectedValue={jobType}
                    style={styles.picker}
                    onValueChange={(itemValue) => setJobType(itemValue)}
                >
                    <Picker.Item label="Select Job Type" value="" />
                    <Picker.Item label="Full-time" value="Full-time" />
                    <Picker.Item label="Part-time" value="Part-time" />
                    <Picker.Item label="Contract" value="Contract" />
                </Picker>
                <Picker
                    selectedValue={categoryId}
                    style={styles.picker}
                    onValueChange={(itemValue) => {
                        setCategoryId(itemValue);
                        if (itemValue === 'new_category') {
                            handleCreateNewCategory();
                        } else {
                            setCreatingNewCategory(false);
                            setNewCategoryName('');
                        }
                    }}
                >
                    <Picker.Item label="Select Category" value="" />
                    {categories.map((category) => (
                        <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                    <Picker.Item label="+ Create New Category" value="new_category" />
                </Picker>

                {creatingNewCategory && (
                    <View style={styles.newCategoryContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="New Category Name"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                        />
                        <Button
                            title={loadingNewCategory ? 'Saving...' : 'Save Category'}
                            onPress={handleSaveNewCategory}
                            loading={loadingNewCategory}
                            disabled={loadingNewCategory}
                            buttonStyle={styles.saveButton}
                            titleStyle={styles.buttonText}
                        />
                        <Button
                            title="Cancel"
                            onPress={() => {
                                setCreatingNewCategory(false);
                                setNewCategoryName('');
                                setCategoryId(''); // Reset category selection
                            }}
                            buttonStyle={styles.cancelButton}
                            titleStyle={styles.buttonText}
                        />
                    </View>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Application Deadline (YYYY-MM-DD)"
                    value={applicationDeadline}
                    onChangeText={setApplicationDeadline}
                />
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Job Description"
                    multiline
                    value={description}
                    onChangeText={setDescription}
                />
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Requirements"
                    multiline
                    value={requirements}
                    onChangeText={setRequirements}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Salary"
                    keyboardType="numeric"
                    value={salary}
                    onChangeText={setSalary}
                />

                <Button
                    title="Add Custom Question"
                    onPress={handleAddQuestion}
                    buttonStyle={styles.addQuestionButton}
                    titleStyle={styles.buttonText}
                    containerStyle={{ marginTop: 15 }}
                />

                {showCustomQuestions && (
                    <CustomQuestions
                        questions={customQuestions}
                        onAddQuestion={() => setCustomQuestions([...customQuestions, { question: '', answer: '' }])}
                        onRemoveQuestion={handleRemoveQuestion}
                        onQuestionChange={handleQuestionChange}
                        onAnswerChange={handleAnswerChange}
                    />
                )}

                <View style={styles.modalButtonContainer}>
                    <Button
                        title="Save Job"
                        onPress={handleSubmit}
                        loading={loadingSubmit}
                        disabled={loadingSubmit || creatingNewCategory || loadingNewCategory}
                        buttonStyle={styles.saveButton}
                        titleStyle={styles.buttonText}
                        containerStyle={{ marginRight: 10 }}
                    />
                    <Button
                        title="Cancel"
                        onPress={onClose}
                        disabled={loadingSubmit || creatingNewCategory || loadingNewCategory}
                        buttonStyle={styles.cancelButton}
                        titleStyle={styles.buttonText}
                    />
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f4f8',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e293b',
        fontFamily: 'Inter_700Bold',
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
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    picker: {
        width: '100%',
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#10b981',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    cancelButton: {
        backgroundColor: '#ef4444',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
    newCategoryContainer: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#e9ecef',
        borderRadius: 5,
    },
    addQuestionButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 15,
    },
});

export default JobForm;