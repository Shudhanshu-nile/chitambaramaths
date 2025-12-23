import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterExamScreen from '../screens/RegisterExamScreen';
import BottomTabNavigator from './BottomTabNavigator';
import PurchaseSuccessful from '../screens/PurchaseSuccessful';
import ForgotScreen from '../screens/ForgetScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ResetPassword from '../screens/ResetPassword';

const Stack = createNativeStackNavigator();

const Appstack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RegisterExam" component={RegisterExamScreen} />
            <Stack.Screen name="Main" component={BottomTabNavigator} />
            <Stack.Screen name="PurchaseSuccessful" component={PurchaseSuccessful} />
            <Stack.Screen name="Forgot" component={ForgotScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />


        </Stack.Navigator>
    );
};

export default Appstack;
