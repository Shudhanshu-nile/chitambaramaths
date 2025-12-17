import React from 'react';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Gradients, Fonts } from '../constants';

const TicketsScreen = () => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />

            <LinearGradient colors={Gradients.primaryBlue} style={styles.header}>
                <Text style={styles.title}>Tickets</Text>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.placeholderText}>Tickets Screen</Text>
                <Text style={styles.subText}>Content coming soon...</Text>
            </View>
        </View>
    );
};

export default TicketsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightGray,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        fontSize: 20,
        fontFamily: Fonts.InterBold,
        color: Colors.primaryDarkBlue,
        marginBottom: 10,
    },
    subText: {
        fontSize: 14,
        fontFamily: Fonts.InterRegular,
        color: Colors.gray,
    },
});
