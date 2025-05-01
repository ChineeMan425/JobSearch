import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFonts, Inter_600SemiBold, Inter_700Bold, Inter_400Regular } from '@expo-google-fonts/inter';
import { Feather } from '@expo/vector-icons';
import CompanyJobsScreen from '../components/CompanyJobList';
import CompanyAccountScreen from '../accounts/CompanyAccount';
import { RootTabParamList } from '../types/navigation'; // Import your TabParamList type

interface CompanyScreenProps extends BottomTabScreenProps<RootTabParamList, 'Jobs' | 'Account'> {}

const Tab = createBottomTabNavigator<RootTabParamList>();

const CompanyScreen: React.FC<CompanyScreenProps> = () => {
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
            initialRouteName="Jobs"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Feather.glyphMap | undefined;

                    if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase';
                    } else if (route.name === 'Account') {
                        iconName = focused ? 'user' : 'user';
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
             // Move tabBarPosition here
        >
            <Tab.Screen name="Jobs" component={CompanyJobsScreen} />
            <Tab.Screen name="Account" component={CompanyAccountScreen} />
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

export default CompanyScreen;