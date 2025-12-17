import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../assets/images/logo.svg';
import { Colors, Gradients } from '../constants';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
    { id: 1, title: 'Exam Registration', icon: 'book-open-page-variant', color: Colors.lightGreen3, iconColor: Colors.iconBlue1 },
    { id: 2, title: 'Nearby Exam Center', icon: 'map-marker', color: Colors.lightBlue2, iconColor: Colors.iconBlue2 },
    { id: 3, title: 'Exam Result', icon: 'trophy', color: Colors.lightBlue3, iconColor: Colors.iconBlue3 },
    { id: 4, title: 'Event Photos', icon: 'image-multiple', color: Colors.lightGreen2, iconColor: Colors.iconGreen },
    { id: 5, title: 'Book Event Tickets', icon: 'ticket-confirmation', color: Colors.lightGreen4, iconColor: Colors.iconTeal },
];

const WelcomeScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />

            {/* Header Section */}
            <LinearGradient
                colors={Gradients.primaryBlue}
                style={styles.header}
            >
                <View style={styles.logoCard}>
                    <Logo height={80} />
                </View>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.welcomeText}>Welcome to</Text>
                    <Text style={styles.brandName}>Chithambara Maths!</Text>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <View style={styles.dividerDot} />
                    <View style={styles.dividerLine} />
                </View>

                <Text style={styles.subHeader}>Quick Start Guide</Text>
            </LinearGradient>

            {/* Content Section */}
            <View style={styles.contentContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.menuList}>
                        {MENU_ITEMS.map((item, index) => (
                            <View key={item.id} style={styles.menuItemWrapper}>
                                {index !== 0 && <View style={styles.connectorLine} />}
                                <TouchableOpacity style={styles.menuItem}>
                                    <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                                        <Icon name={item.icon} size={24} color={item.iconColor} />
                                    </View>
                                    <Text style={styles.menuText}>{item.title}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Bottom Section */}
            <View style={styles.bottomSection}>
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => navigation.navigate('Main')}
                >
                    <Text style={styles.exploreButtonText}>Explore</Text>
                    <Icon name="arrow-right" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        width: '100%',
        paddingTop: 60,
        paddingBottom: 120, // Space for overlap + text
        paddingHorizontal: 0,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    logoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        width: width * 0.9,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        // Height handled by child content or minHeight if needed
    },
    headerTextContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    welcomeText: {
        fontSize: 20,
        color: 'white',
        fontWeight: '600',
    },
    brandName: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        marginTop: 5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginVertical: 15,
        opacity: 0.3
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'white',
    },
    dividerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginHorizontal: 10,
    },
    subHeader: {
        fontSize: 18,
        color: 'white',
        marginTop: 5,
        marginBottom: 10, // Push text up from bottom edge
    },
    contentContainer: {
        flex: 1,
        marginTop: -60, // Overlap
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 20,
        alignItems: 'center',
        width: width,
    },
    menuList: {
        backgroundColor: 'white',
        width: width * 0.9,
        borderRadius: 15,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuItemWrapper: {
        position: 'relative',
    },
    connectorLine: {
        position: 'absolute',
        top: -15, // Adjust based on spacing
        left: 31, // Align center with icon box (width 50 / 2 = 25 + margin if any)
        width: 1,
        height: 20, // Height to bridge gaps
        backgroundColor: '#ddd',
        zIndex: 0,
        // Using dashes is harder in layout, using solid for now or dotted border hack
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 1,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    bottomSection: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    exploreButton: {
        backgroundColor: '#0c4b8b',
        borderRadius: 10,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exploreButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
});

export default WelcomeScreen;
