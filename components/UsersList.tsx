import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Button } from 'react-native-elements';
import { supabase } from '../supabase';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { Card } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editedFullName, setEditedFullName] = useState('');
    const [editedUsername, setEditedUsername] = useState('');
    const [editedRole, setEditedRole] = useState('');
    const [roles, setRoles] = useState([]); // State to store available roles

    let [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_400Regular,
    });

    // Fetch roles from the database
    const fetchRoles = async () => {
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('name');
            if (error) {
                console.error('Error fetching roles:', error);
                Alert.alert('Error', 'Failed to fetch roles.');
                return;
            }
            const roleNames = data.map(role => role.name);
            setRoles(roleNames);
        } catch (error) {
            console.error('Error fetching roles:', error);
            Alert.alert('Error', 'An unexpected error occurred while fetching roles.');
        }
    };

    // Fetch users and roles on component mount
    useEffect(() => {
        let isMounted = true; // To prevent setting state on unmounted component

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const { data: usersData, error: usersError } = await supabase
                    .from('profiles')
                    .select('*, roles(name)')
                    .order('created_at', { ascending: false });

                if (usersError) {
                    console.error('Error fetching users:', usersError);
                    Alert.alert('Error', 'Failed to fetch users.');
                    return;
                }
                if (isMounted) {
                    setUsers(usersData);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                Alert.alert('Error', 'An unexpected error occurred while fetching users.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRoles();
        fetchUsers();

        return () => {
            isMounted = false; // Cleanup to prevent state updates on unmounted component
        };
    }, []);

    const handleEdit = (user) => {
        setEditingUserId(user.id);
        setEditedFullName(user.full_name);
        setEditedUsername(user.username);
        setEditedRole(user.role?.name || '');
    };

    const handleSave = async (userId) => {
        try {
            setLoading(true);

            let roleIdToUpdate;
            if (editedRole) {
                const { data: roleData, error: roleError } = await supabase
                    .from('roles')
                    .select('id')
                    .eq('name', editedRole)
                    .single();

                if (roleError) {
                    console.error('Error fetching role ID:', roleError);
                    Alert.alert('Error', 'Failed to update user role.');
                    setLoading(false);
                    return;
                }
                roleIdToUpdate = roleData?.id; // Added check for roleData
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: editedFullName,
                    username: editedUsername,
                    role_id: roleIdToUpdate,
                })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating user:', updateError);
                Alert.alert('Error', 'Failed to update user.');
                setLoading(false);
                return;
            }

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId
                        ? { ...user, full_name: editedFullName, username: editedUsername, role: { name: editedRole } }
                        : user
                )
            );
            setEditingUserId(null);
            Alert.alert('Success', 'User updated successfully.');
        } catch (error) {
            console.error('Error updating user:', error);
            Alert.alert('Error', 'An unexpected error occurred while updating the user.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditingUserId(null);
    };

    const handlePromoteDemote = async (userId, currentRoleName) => {
        try {
            setLoading(true);
            const newRoleName = currentRoleName === 'regular_user' ? 'company' : 'regular_user';

            const { data: newRoleData, error: roleError } = await supabase
                .from('roles')
                .select('id')
                .eq('name', newRoleName)
                .single();

            if (roleError || !newRoleData) {
                console.error('Error fetching role ID:', roleError);
                Alert.alert('Error', `Failed to ${newRoleName === 'company' ? 'promote' : 'demote'} user.`);
                setLoading(false);
                return;
            }

            const newRoleId = newRoleData.id;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role_id: newRoleId })
                .eq('id', userId);

            if (updateError) {
                console.error('Error updating role:', updateError);
                Alert.alert('Error', `Failed to ${newRoleName === 'company' ? 'promote' : 'demote'} user.`);
                setLoading(false);
                return;
            }

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: { name: newRoleName } } : user
                )
            );
            Alert.alert('Success', `User ${newRoleName === 'company' ? 'promoted' : 'demoted'} successfully.`);
        } catch (error) {
            console.error('Error promoting/demoting user:', error);
            Alert.alert('Error', 'An unexpected error occurred while promoting/demoting the user.');
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
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Users</Text>
            {loading ? (
                <Text>Loading users...</Text>
            ) : users.length === 0 ? (
                <Text>No users found.</Text>
            ) : (
                users.map(user => (
                    <Card key={user.id} style={styles.userCard}>
                        <Card.Content>
                            <View style={styles.userInfo}>
                                {editingUserId === user.id ? (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            value={editedUsername}
                                            onChangeText={setEditedUsername}
                                            placeholder="Username"
                                        />
                                        <TextInput
                                            style={styles.input}
                                            value={editedFullName}
                                            onChangeText={setEditedFullName}
                                            placeholder="Full Name"
                                        />
                                        <Picker
                                            selectedValue={editedRole}
                                            onValueChange={(itemValue) =>
                                                setEditedRole(itemValue)
                                            }>
                                            {roles.map((roleName) => (
                                                <Picker.Item key={roleName} label={roleName} value={roleName} />
                                            ))}
                                        </Picker>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.userName}>{user.username}</Text>
                                        <Text style={styles.userFullName}>{user.full_name}</Text>
                                        <Text style={styles.userRole}>Role: {user.role?.name || 'N/A'}</Text>
                                    </>
                                )}
                            </View>
                            <View style={styles.buttonContainer}>
                                {editingUserId === user.id ? (
                                    <>
                                        <Button
                                            title="Save"
                                            onPress={() => handleSave(user.id)}
                                            disabled={loading}
                                            buttonStyle={styles.saveButton}
                                            titleStyle={styles.buttonText}
                                        />
                                        <Button
                                            title="Cancel"
                                            onPress={handleCancel}
                                            disabled={loading}
                                            buttonStyle={styles.cancelButton}
                                            titleStyle={styles.buttonText}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            title="Edit"
                                            onPress={() => handleEdit(user)}
                                            disabled={loading}
                                            buttonStyle={styles.editButton}
                                            titleStyle={styles.buttonText}
                                        />
                                        {user.role?.name === 'regular_user' || user.role?.name === 'company' ? (
                                            <Button
                                                title={user.role?.name === 'regular_user' ? 'Promote to Company' : 'Demote to Regular User'}
                                                onPress={() => handlePromoteDemote(user.id, user.role.name)}
                                                disabled={loading}
                                                buttonStyle={user.role?.name === 'regular_user' ? styles.promoteButton : styles.demoteButton}
                                                titleStyle={styles.buttonText}
                                            />
                                        ) : (
                                            <Text style={styles.adminRoleText}>Admin User</Text>
                                        )}
                                    </>
                                )}
                            </View>
                        </Card.Content>
                    </Card>
                ))
            )}
        </ScrollView>
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
        fontFamily: 'Inter_700Bold',
    },
    userCard: {
        marginBottom: 15,
        elevation: 3,
        borderRadius: 10,
    },
    userInfo: {
        marginBottom: 10,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        fontFamily: 'Inter_600SemiBold',
    },
    userFullName: {
        fontSize: 16,
        color: '#4b5563',
        fontFamily: 'Inter_400Regular',
    },
    userRole: {
        fontSize: 14,
        color: '#71717a',
        fontFamily: 'Inter_400Regular',
    },
    buttonContainer: {
        marginTop: 10,
        alignItems: 'flex-start',
    },
    promoteButton: {
        backgroundColor: '#10b981',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    demoteButton: {
        backgroundColor: '#ef4444',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
    adminRoleText: {
        color: '#71717a',
        fontSize: 14,
        fontFamily: 'Inter_600SemiBold',
    },
    input: {
        width: '100%',
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 5,
        backgroundColor: '#fff',
        fontFamily: 'Inter_400Regular',
    },
});

export default UsersList;