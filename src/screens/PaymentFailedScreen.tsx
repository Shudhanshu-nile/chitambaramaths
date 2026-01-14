import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Colors, FontSizes, Fonts, Spacing, ScreenNames, responsiveScreenHeight } from '../constants';
import { replaceToMain } from '../navigation/GlobalNavigation';
import OtherService from '../service/OtherService';

const PaymentFailedScreen = ({ navigation }: any) => {
    const { user } = useSelector((state: any) => state.user);
    const [recentOrder, setRecentOrder] = useState<any>(null);

    // Fetch payment history directly from API
    useEffect(() => {
        const fetchLatestPayment = async () => {
            try {
                const response = await OtherService.getPaymentHistory(1);

                if (response.data && response.data.status && response.data.data?.data?.length > 0) {
                    const latestPayment = response.data.data.data[0];
                    setRecentOrder(latestPayment);
                }
            } catch (error) {
                console.error('PaymentFailedScreen: Error fetching payment history:', error);
            }
        };

        fetchLatestPayment();
    }, []);

    const handleRetry = async () => {
        if (recentOrder?.payment_url) {
            try {
                await Linking.openURL(recentOrder.payment_url);
            } catch (err) {
                console.error('An error occurred', err);
                navigation.navigate(ScreenNames.RegisterExam);
            }
        } else {
            navigation.navigate(ScreenNames.RegisterExam);
        }
    };

    const handleGoHome = () => {
        replaceToMain(ScreenNames.Home);
    };

    // Helper to safely get display values
    const getCurrencySymbol = (currency: string, country?: string) => {
        if (currency) {
            const code = currency.toUpperCase();
            switch (code) {
                case 'GBP': return '£';
                case 'USD': return '$';
                case 'AUD': return '$';
                case 'CAD': return '$';
                case 'EUR': return '€';
                case 'NZD': return '$';
                case 'SGD': return '$';
            }
        }
        if (country) {
            const upperCountry = country.toUpperCase();
            if (upperCountry.includes('UNITED KINGDOM') || upperCountry.includes('UK')) return '£';
            if (upperCountry.includes('USA') || upperCountry.includes('UNITED STATES')) return '$';
            if (upperCountry.includes('AUSTRALIA')) return '$';
            if (upperCountry.includes('CANADA')) return '$';
            if (upperCountry.includes('FRANCE') || upperCountry.includes('GERMANY') || upperCountry.includes('NETHERLANDS') || upperCountry.includes('IRELAND') || upperCountry.includes('SPAIN')) return '€';
            if (upperCountry.includes('NEW ZEALAND')) return '$';
            if (upperCountry.includes('SINGAPORE')) return '$';
        }
        return '£';
    };

    const currencyCode = recentOrder?.currency;
    const countryName = recentOrder?.country || recentOrder?.country_name;
    const currencySymbol = getCurrencySymbol(currencyCode, countryName);
    const amount = recentOrder?.amount ? `${currencySymbol}${recentOrder.amount}` : `Failed`;


    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.red} translucent={false} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
            >
                {/* Header Background & Content */}
                <LinearGradient
                    colors={[Colors.red, '#D32F2F']}
                    style={styles.headerBackground}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.iconCircle}>
                            <Icon name="close" size={50} color={Colors.red} />
                        </View>
                        <Text style={styles.title}>Payment Failed</Text>
                        <Text style={styles.subtitle}>
                            We couldn't process your payment.
                        </Text>
                    </View>
                </LinearGradient>

                {/* White Details Card */}
                <View style={styles.detailsCard}>

                    <View style={styles.paymentHeader}>
                        <View style={styles.paymentInfoCol}>
                            <Text style={styles.paymentInfoLabel}>Attempted Amount</Text>
                            <Text style={styles.amountValue}>{amount}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Registration Details</Text>

                    {/* Student Name */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconBox}>
                            <Icon name="school" size={24} color={Colors.primaryDarkBlue} />
                        </View>
                        <View style={styles.summaryDetails}>
                            <Text style={styles.summaryLabel}>Student Name</Text>
                            <Text style={styles.summaryValue}>{user?.fullName || 'Student'}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
                            <Text style={styles.primaryButtonText}>Pay Again</Text>
                            <Icon name="refresh" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.outlineButton} onPress={handleGoHome}>
                            <Text style={styles.outlineButtonText}>Return to Home</Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View style={{ height: 50 }} />
            </ScrollView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    headerBackground: {
        width: '100%',
        paddingBottom: 60,
    },
    scrollContent: {
        paddingBottom: Spacing.spacing.xl,
        paddingTop: 0,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: Spacing.spacing.lg,
        paddingTop: 60,
        paddingBottom: 80,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: FontSizes.xxl,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
        textAlign: 'center',
        marginBottom: Spacing.spacing.xs,
    },
    subtitle: {
        fontSize: FontSizes.sm,
        fontFamily: Fonts.InterRegular,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginBottom: Spacing.spacing.xl,
    },
    detailsCard: {
        backgroundColor: '#F5F7FA',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24,
        paddingHorizontal: Spacing.spacing.lg,
        paddingTop: Spacing.spacing.xl,
        flex: 1,
        minHeight: responsiveScreenHeight(60),
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#EF5350', // Lighter red
        borderRadius: Spacing.borderRadius.medium,
        padding: Spacing.spacing.lg,
        marginBottom: Spacing.spacing.lg,
    },
    paymentInfoCol: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentInfoLabel: {
        fontSize: FontSizes.xs,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        fontFamily: Fonts.InterRegular,
    },
    amountValue: {
        fontSize: FontSizes.xxl,
        color: Colors.white,
        fontFamily: Fonts.InterBold,
    },
    sectionTitle: {
        fontSize: FontSizes.lg,
        fontFamily: Fonts.InterBold,
        color: '#374151',
        marginTop: Spacing.spacing.md,
        marginBottom: Spacing.spacing.md,
    },
    summaryItem: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: Spacing.borderRadius.medium,
        padding: Spacing.spacing.md,
        marginBottom: Spacing.spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    summaryIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFEBEE', // Light red bg
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.spacing.md,
    },
    summaryDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    summaryLabel: {
        fontSize: FontSizes.xs,
        color: '#6B7280',
        fontFamily: Fonts.InterRegular,
    },
    summaryValue: {
        fontSize: FontSizes.md,
        color: '#111827',
        fontFamily: Fonts.InterBold,
        marginBottom: 2,
    },
    summarySubtext: {
        fontSize: FontSizes.xs,
        color: '#9CA3AF',
        fontFamily: Fonts.InterRegular,
    },
    actionButtonsContainer: {
        marginTop: Spacing.spacing.xl,
        gap: Spacing.spacing.md,
    },
    primaryButton: {
        backgroundColor: Colors.red,
        borderRadius: Spacing.borderRadius.medium,
        paddingVertical: Spacing.spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    primaryButtonText: {
        color: Colors.white,
        fontFamily: Fonts.InterBold,
        fontSize: FontSizes.md,
    },
    outlineButton: {
        backgroundColor: Colors.white,
        borderRadius: Spacing.borderRadius.medium,
        paddingVertical: Spacing.spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.borderGray,
    },
    outlineButtonText: {
        color: Colors.textGray,
        fontFamily: Fonts.InterBold,
        fontSize: FontSizes.md,
    },
});

export default PaymentFailedScreen;
