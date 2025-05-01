// navigation/types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Define the parameter list for your Root Stack Navigator
export type RootStackParamList = {
    Auth: undefined;
    Admin: undefined;
    Main: undefined; // This will hold our BottomTabNavigator
};

// Define parameter list for your Bottom Tab Navigator
export type RootTabParamList = {
    Jobs: undefined;
    Account: undefined;
    Company: undefined;
    User: undefined;
};

// Define props for screens within the Root Stack Navigator
export type AuthScreenProps = NativeStackScreenProps<RootStackParamList, 'Auth'>;
export type AdminScreenProps = NativeStackScreenProps<RootStackParamList, 'Admin'>;
export type MainScreenProps = NativeStackScreenProps<RootStackParamList, 'Main'>;

// Define props for screens within the Bottom Tab Navigator
export type JobsScreenProps = BottomTabScreenProps<RootTabParamList, 'Jobs'>;
export type AccountScreenProps = BottomTabScreenProps<RootTabParamList, 'Account'>;
export type CompanyScreenProps = BottomTabScreenProps<RootTabParamList, 'Company'>;
export type UserScreenProps = BottomTabScreenProps<RootTabParamList, 'User'>;