import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Fonts, ScreenNames } from '../constants';

// Tab Screens
import HomeScreen from '../screens/HomeScreen';
import CentersScreen from '../screens/CentersScreen';
import TicketsScreen from '../screens/TicketsScreen';
import StoreScreen from '../screens/StoreScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

import { useSelector } from 'react-redux';
import { RootState } from '../redux/Reducer/RootReducer';

const BottomTabNavigator = () => {
    const { isLoggedIn } = useSelector((state: RootState) => state.user);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0c4b8b',
                tabBarInactiveTintColor: '#999',
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: Colors.borderGray,
                    paddingVertical: 12,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    marginTop: 4,
                    fontFamily: Fonts.InterRegular,
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name={ScreenNames.Home}
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="home"
                            size={focused ? 30 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ScreenNames.Centers}
                component={CentersScreen}
                options={{
                    tabBarLabel: 'Centers',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="map-marker"
                            size={focused ? 30 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name={ScreenNames.Tickets}
                component={TicketsScreen}
                options={{
                    tabBarLabel: 'My Order',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="ticket-confirmation"
                            size={focused ? 30 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            {/* <Tab.Screen
                name={ScreenNames.Store}
                component={StoreScreen}
                options={{
                    tabBarLabel: 'Store',
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="shopping"
                            size={focused ? 30 : 24}
                            color={color}
                        />
                    ),
                }}
            /> */}
            {isLoggedIn && (
                <Tab.Screen
                    name={ScreenNames.Profile}
                    component={ProfileScreen}
                    options={{
                        tabBarLabel: 'Profile',
                        tabBarIcon: ({ color, focused }) => (
                            <Icon
                                name="account"
                                size={focused ? 30 : 24}
                                color={color}
                            />
                        ),
                    }}
                />
            )}
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
