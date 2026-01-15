import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { useIsFocused } from '@react-navigation/native'; // Added useIsFocused
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { Colors, FontSizes, Fonts, Spacing, ScreenNames, responsiveScreenHeight } from '../constants';
import { replaceToMain } from '../navigation/GlobalNavigation';
import OtherService from '../service/OtherService';

const PaymentPendingScreen = ({ navigation, route }: any) => {
    const isFocused = useIsFocused();
    const { user } = useSelector((state: any) => state.user);
    const [recentOrder, setRecentOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [childrenList, setChildrenList] = useState<any[]>([]); // Added for name fix

    // Fetch payment history directly from API
    const fetchLatestPayment = async () => {
        try {
            const response = await OtherService.getPaymentHistory(1);
            console.log('PaymentPendingScreen: API Response received');

            if (response.data && response.data.status && response.data.data?.data?.length > 0) {
                const latestPayment = response.data.data.data[0];
                console.log('PaymentPendingScreen: Latest payment:', latestPayment.registration_id, latestPayment.payment_status);
                setRecentOrder(latestPayment);
            } else {
                console.log('PaymentPendingScreen: No payment history found');
                setRecentOrder(null);
            }
        } catch (error) {
            console.error('PaymentPendingScreen: Error fetching payment history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchChildren = React.useCallback(async () => {
        try {
            const response = await OtherService.getChildren();
            if (response.data && Array.isArray(response.data)) {
                setChildrenList(response.data);
            }
        } catch (error) {
            console.error('PaymentPendingScreen: Failed to fetch children', error);
        }
    }, []);

    // Fetch on mount and poll every 5 seconds
    useEffect(() => {
        // If coming from registration, wait 6 seconds before first fetch
        // to give backend time to update payment status
        fetchChildren();
        const initialDelay = route.params?.fromRegistration ? 6000 : 0;

        let initialTimer: any;
        let interval: any;

        if (isFocused) {
            initialTimer = setTimeout(() => {
                fetchLatestPayment();
            }, initialDelay);

            interval = setInterval(() => {
                fetchLatestPayment();
            }, 5000); // Poll every 5 seconds
        }

        return () => {
            if (initialTimer) clearTimeout(initialTimer);
            if (interval) clearInterval(interval);
        };
    }, [isFocused]); // Depend on isFocused

    // Check status and redirect if necessary
    useEffect(() => {
        if (!isLoading && recentOrder) {
            const rawStatus = recentOrder.payment_status || recentOrder.status || '';
            const status = rawStatus.toLowerCase();

            console.log('PaymentPendingScreen: Checking status:', status);

            if (status === 'success' || status === 'succeeded' || status.includes('success')) {
                console.log('PaymentPendingScreen: ✅ Redirecting to success screen');
                navigation.replace(ScreenNames.PaymentSuccess);
            } else if (status === 'failed' || status === 'not_initiated' || status === 'canceled') {
                console.log('PaymentPendingScreen: ❌ Redirecting to failed screen');
                navigation.replace(ScreenNames.PaymentFailed);
            }
            // If 'pending' or 'processing', stay on this screen and keep polling
        }
    }, [recentOrder, isLoading, navigation]);


    const handleCheckStatus = () => {
        fetchLatestPayment();
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
    const amount = recentOrder?.amount ? `${currencySymbol}${recentOrder.amount}` : `Pending`;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.blueDark} translucent={false} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
            >
                {/* Header Background & Content */}
                <LinearGradient
                    colors={[Colors.blueDark, '#4E86B0']}
                    style={styles.headerBackground}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.iconCircle}>
                            <ActivityIndicator size="large" color={Colors.primaryBlue} />
                        </View>
                        <Text style={styles.title}>Payment Processing</Text>
                        <Text style={styles.subtitle}>
                            We are checking your payment status...
                        </Text>
                    </View>
                </LinearGradient>

                {/* White Details Card */}
                <View style={styles.detailsCard}>

                    <View style={styles.paymentHeader}>
                        <View style={styles.paymentInfoCol}>
                            <Text style={styles.paymentInfoLabel}>Pending Amount</Text>
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
                            <Text style={styles.summaryValue}>
                                {childrenList.find((c: any) => c.id == recentOrder?.child_id)?.name || recentOrder?.child_name || user?.fullName || 'Student'}
                            </Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleCheckStatus}>
                            <Text style={styles.primaryButtonText}>Refresh Status</Text>
                            <Icon name="refresh" size={20} color={Colors.white} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.outlineButton} onPress={handleGoHome}>
                            <Text style={styles.outlineButtonText}>Return to Home</Text>
                        </TouchableOpacity>

                        <Text style={styles.infoText}>
                            Note: If you have completed the payment, it may take a few moments to reflect.
                        </Text>
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
        backgroundColor: Colors.blueDark, // 
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
        backgroundColor: '#E0F2FE', // Light blue bg
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
        backgroundColor: Colors.primaryBlue,
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
    infoText: {
        fontSize: FontSizes.sm,
        color: Colors.gray,
        fontFamily: Fonts.InterRegular,
        textAlign: 'center',
        marginTop: Spacing.spacing.sm,
    }
});

export default PaymentPendingScreen;
