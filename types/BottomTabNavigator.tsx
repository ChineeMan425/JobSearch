import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import UserScreen from '../screens/User';
import AdminSpecificScreen from '../screens/Admin';
import CompanySpecificScreen from '../screens/Company';
import { RootTabParamList } from './navigation';
import { Feather } from '@expo/vector-icons';
import { SessionContext, SessionContextType } from '../utils/sessionContext'; // Import the type

const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTabNavigator = () => {
    const contextValue = useContext(SessionContext);
    const userRole = contextValue?.session?.user?.app_metadata?.role;

    return (
        <Tab.Navigator
            initialRouteName="User"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Feather.glyphMap | undefined;

                    if (route.name === 'User') {
                        iconName = focused ? 'user' : 'user';
                    } else if (route.name === 'Admin') {
                        iconName = focused ? 'settings' : 'settings';
                    } else if (route.name === 'Company') {
                        iconName = focused ? 'briefcase' : 'briefcase';
                    }

                    return iconName ? <Feather name={iconName} size={size} color={color} /> : null;
                },
                tabBarActiveTintColor: '#ff9800',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontFamily: 'Inter_600SemiBold',
                },
                tabBarStyle: {
                    backgroundColor: '#fff3e0',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen name="User" component={UserScreen} />
            {userRole === 'admin' && (
                <Tab.Screen name="Admin" component={AdminSpecificScreen} />
            )}
            {userRole === 'company' && (
                <Tab.Screen name="Company" component={CompanySpecificScreen} />
            )}
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;