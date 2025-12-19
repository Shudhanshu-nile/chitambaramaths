import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    StatusBar,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Gradients, Fonts } from '../constants';
import Logo from '../assets/images/logo.svg';
import { BlurView } from '@react-native-community/blur';
import { navigate } from '../navigation/GlobalNavigation';
// import { useAuth } from '../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/Reducer/User';
import { RootState } from '../redux/Reducer/RootReducer';

const ProfileScreen = () => {
    // const { signOut } = useAuth();
    const dispatch = useDispatch<any>();
    const { user } = useSelector((state: RootState) => state.user);

    // Fallback to local state if Redux user is null (though validation should prevent access)
    // Or just use Redux user data directly
    const userProfile = {
        name: user?.fullName || 'Guest User',
        email: user?.email || 'guest@example.com',
        profileImage: require('../assets/images/avatar.png'),
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', onPress: () => { }, style: 'cancel' },
            {
                text: 'Sign Out',
                onPress: async () => {
                    await dispatch(logoutUser());
                    navigate('Welcome');
                },
                style: 'destructive',
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => console.log('Deleting account...'),
                    style: 'destructive',
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.primaryBlue}
            />

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollContent}
            >
                {/* Header with gradient background */}
                <LinearGradient colors={Gradients.primaryBlue} style={styles.header}>
                    <View style={styles.headerTop}>
                        <View style={styles.logoPill}>
                            <Logo height={36} width={176} />
                        </View>

                        <TouchableOpacity style={styles.notificationBtn}>
                            <Icon name="bell" size={22} color="#fff" />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Profile Content */}

                <View style={styles.content}>
                    <View style={styles.profileCardHeader}>
                        <Text style={styles.profileHeading}>My Profile</Text>
                    </View>
                    {/* Profile Card with BlurView */}

                    <BlurView
                        style={styles.blurContainer}
                        blurType="thinMaterialLight"
                        blurAmount={4}
                        reducedTransparencyFallbackColor="white"
                    >
                        <View style={styles.profileCard}>
                            <View style={styles.profileImageContainer}>
                                <Image
                                    source={userProfile.profileImage}
                                    style={styles.profileImage}
                                />
                            </View>

                            <View style={styles.profileInfoContainer}>
                                <Text style={styles.userName}>{userProfile.name}</Text>
                                <View style={styles.divider} />
                                <Text style={styles.userEmail}>{userProfile.email}</Text>
                            </View>
                        </View>
                    </BlurView>

                    {/* Action Buttons */}
                    <View style={styles.buttonsContainer}>
                        {/* Sign Out Button */}
                        <TouchableOpacity
                            style={styles.signOutButton}
                            onPress={handleSignOut}
                            activeOpacity={0.8}
                        >
                            <Icon
                                name="logout"
                                size={20}
                                color={Colors.white}
                                style={styles.buttonIcon}
                            />
                            <Text style={styles.signOutButtonText}>Sign Out</Text>
                        </TouchableOpacity>

                        {/* Delete Account Button */}
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeleteAccount}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    scrollContent: {
        flex: 1,
    },
    header: {
        height: 430,
        paddingTop: 0,
        zIndex: -999,
        position: 'relative'
    },
    headerTop: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 70,
    },
    logoPill: {
        backgroundColor: Colors.white,
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        width: 208,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.whiteOverlay20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.red,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    appTitleContainer: {
        flex: 1,
        marginRight: 15,
    },
    appTitle: {
        fontSize: 16,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
        marginBottom: 4,
    },
    appSubtitle: {
        fontSize: 12,
        fontFamily: Fonts.InterRegular,
        color: Colors.whiteOverlay80,
    },
    notificationIcon: {
        width: 44,
        height: 44,
        backgroundColor: Colors.whiteOverlay20,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        marginTop: -310,
        padding: 20,
        zIndex: 999
        // paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: 'rgba(0, 0, 0, 0.01)',
        borderRadius: 16,
        // padding: 0,
        // marginBottom: 30,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 3,
        // zIndex:999,
        // overflow: 'visible',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    blurContainer: {
        borderRadius: 16,
        //   overflow: 'visible',
        // marginTop:20,
        // overflow: 'hidden',
        // marginBottom: 10,
    },
    profileCardHeader: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        // backgroundColor: Colors.lightBlue3,
        // borderBottomWidth: 1,
        // borderBottomColor: Colors.borderGray,
    },
    profileHeading: {
        fontSize: 20,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
    },
    profileImageContainer: {
        overflow: 'visible',
        alignItems: 'center',
        marginTop: 10,
        zIndex: 999
        // paddingVertical: 24,
        // backgroundColor: 'rgba(227, 242, 253, 0.6)',
    },
    profileImage: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        // borderRadius: 50,
        // borderWidth: 4,
        // borderColor: Colors.white,
    },
    profileInfoContainer: {
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    userName: {
        fontSize: 18,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
        marginBottom: 12,
    },
    divider: {
        width: '90%',
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 7,
    },
    userEmail: {
        marginTop: 10,
        fontSize: 14,
        fontFamily: Fonts.InterRegular,
        color: Colors.white,
    },
    buttonsContainer: {
        gap: 12,
        marginTop: 70,
    },
    signOutButton: {
        backgroundColor: Colors.primaryBlue,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonIcon: {
        marginRight: 10,
    },
    signOutButtonText: {
        fontSize: 14,
        fontFamily: Fonts.InterSemiBold,
        color: Colors.white,
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#005884',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 14,
        fontFamily: Fonts.InterSemiBold,
        color: '#005884',
        textAlign: 'center',
    },
});