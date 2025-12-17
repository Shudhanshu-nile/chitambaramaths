import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../assets/images/logo.svg';
import { Colors, Gradients, ScreenNames } from '../constants';

const { width } = Dimensions.get('window');

const SplashScreen = ({ navigation }: { navigation: any }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace(ScreenNames.Welcome);
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <LinearGradient
            colors={Gradients.primaryBlue}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />
            <View style={styles.topContainer}>
                <View style={styles.card}>
                    <Logo width="100%" height={80} preserveAspectRatio="xMidYMid meet" />
                </View>
            </View>

            <View style={styles.centerContainer}>
                <Text style={styles.welcomeText}>Welcome to</Text>
                <Text style={styles.brandName}>CHITHAMBARA MATHS!</Text>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <View style={styles.dividerDot} />
                    <View style={styles.dividerLine} />
                </View>

                <Text style={styles.tagline}>Excellence in Mathematics Education</Text>
            </View>

            <View style={styles.bottomContainer}>
                <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 15,
        padding: 20,
        width: width * 0.9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 5, // Android shadow
        shadowColor: Colors.black, // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primaryDarkBlue,
        flex: 1,
        marginRight: 10,
    },
    cardSubtitle: {
        fontSize: 10,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 2
    },
    logoContainer: {
        // Add styling if needed for logo wrapper
    },
    centerContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 18,
        color: Colors.white,
        marginBottom: 5,
    },
    brandName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 20,
        textAlign: 'center',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginBottom: 20,
        opacity: 0.5
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.white,
    },
    dividerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.white,
        marginHorizontal: 10,
    },
    tagline: {
        fontSize: 16,
        color: Colors.white,
        textAlign: 'center',
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: 40,
        alignItems: 'center',
    },
    progressBar: {
        width: width * 0.8,
        height: 2,
        backgroundColor: Colors.whiteOverlay30,
        overflow: 'hidden',
    },
    progressFill: {
        width: '40%', // Static for now, can be animated
        height: '100%',
        backgroundColor: '#8bc34a', // Greenish color from image
    }

});

export default SplashScreen;
