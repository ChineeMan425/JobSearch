import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import UsersList from '../components/UsersList';
import JobsList from '../components/JobsList';
import AccountAdminScreen from '../accounts/AdminAccount';
import { RootTabParamList } from '../types/navigation';
import JobsScreen from "../components/JobsList"; // Import your RootTabParamList

// Define the specific ParamList for the Admin Tabs
interface AdminTabParamList extends RootTabParamList {
    Users: undefined;
    Jobs: undefined;
    Account: undefined;
}

interface AdminScreenProps extends BottomTabScreenProps<AdminTabParamList, 'Users' | 'Jobs' | 'Account'> {}

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminScreen: React.FC<AdminScreenProps> = () => {
    let [fontsLoaded] = useFonts({
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_400Regular,
    });

    if (!fontsLoaded) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Feather.glyphMap | undefined;

                    if (route.name === 'Users') {
                        iconName = focused ? 'users' : 'users';
                    } else if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase';
                    } else if (route.name === 'Account') {
                        iconName = focused ? 'user' : 'user';
                    }

                    return iconName ? <Feather name={iconName} size={size} color={color} /> : null;
                },
                tabBarActiveTintColor: '#6366f1',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: 'Inter_600SemiBold',
                },
                tabBarStyle: {
                    backgroundColor: '#f0f4f8',
                },
                headerShown: false, // Typically hide headers within tab navigators
            })}
            tabBarPosition="bottom"
        >
            <Tab.Screen name="Users" component={UsersList} />
            <Tab.Screen name="Jobs" component={JobsScreen} />
            <Tab.Screen name="Account" component={AccountAdminScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AdminScreen;