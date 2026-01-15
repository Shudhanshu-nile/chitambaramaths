
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import {
    Colors,
    FontSizes,
    Spacing,
    Fonts,
    responsiveScreenHeight,
    responsiveScreenWidth,
    ScreenNames,
} from '../constants';
import { replaceToMain } from '../navigation/GlobalNavigation';
import OtherService from '../service/OtherService';

const { width } = Dimensions.get('window');

const PaymentSuccessScreen = ({ navigation, route }: any) => {
    const { user } = useSelector((state: any) => state.user);
    const [recentOrder, setRecentOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [childrenList, setChildrenList] = useState<any[]>([]); // Added for name fix
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 1;

    // Fetch payment history directly from API
    // Added isBackground param to prevent loading spinner on polling
    const fetchLatestPayment = React.useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setIsLoading(true);
            const response = await OtherService.getPaymentHistory(1);
            console.log('PaymentSuccessScreen: API Response received');

            if (response.data && response.data.status && response.data.data?.data?.length > 0) {
                const latestPayment = response.data.data.data[0];
                console.log('PaymentSuccessScreen: Latest payment:', latestPayment.registration_id, latestPayment.payment_status);
                setRecentOrder(latestPayment);
            } else {
                console.log('PaymentSuccessScreen: No payment history found');
                setRecentOrder(null);
            }
        } catch (error) {
            console.error('PaymentSuccessScreen: Error fetching payment history:', error);
            setRecentOrder(null);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    }, []);

    const fetchChildren = React.useCallback(async () => {
        try {
            const response = await OtherService.getChildren();
            if (response.data && Array.isArray(response.data)) {
                setChildrenList(response.data);
            }
        } catch (error) {
            console.error('PaymentSuccessScreen: Failed to fetch children', error);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchChildren(); // Fetch children for mapping

        // If coming from registration, wait 6 seconds before first fetch
        // to give backend time to update payment status
        const initialDelay = route.params?.fromRegistration ? 6000 : 0;

        const initialTimer = setTimeout(() => {
            fetchLatestPayment();
        }, initialDelay);

        // Additional polling if coming from registration
        if (route.params?.fromRegistration) {
            const pollingTimer = setTimeout(() => {
                fetchLatestPayment(true); // Pass true for silent update
            }, 10000);

            return () => {
                clearTimeout(initialTimer);
                clearTimeout(pollingTimer);
            };
        }

        return () => clearTimeout(initialTimer);
    }, [route.params, fetchLatestPayment, fetchChildren]);


    // Check status and redirect if necessary - ONLY after loading is complete
    useEffect(() => {
        // Don't check status while loading or if no data
        if (isLoading || !recentOrder) {
            return;
        }

        const rawStatus = recentOrder.payment_status || recentOrder.status || '';
        const status = rawStatus.toLowerCase();

        console.log('PaymentSuccessScreen: Checking status:', status, 'Retry count:', retryCount);

        if (status === 'success' || status === 'succeeded' || status.includes('success')) {
            console.log('PaymentSuccessScreen: ✅ Staying on success screen');
            // Stay on success screen
            return;
        } else if (status === 'pending' || status === 'processing') {
            console.log('PaymentSuccessScreen: ⏳ Redirecting to pending screen');
            navigation.replace(ScreenNames.PaymentPending);
        } else if (status === 'not_initiated' && route.params?.fromRegistration && retryCount < MAX_RETRIES) {
            // Special case: if coming from registration and status is not_initiated,
            // backend might not have updated yet - wait and retry (max 2 times)
            console.log(`PaymentSuccessScreen: ⏸️ Status is not_initiated, retry ${retryCount + 1}/${MAX_RETRIES}, waiting 3s...`);
            const retryTimer = setTimeout(() => {
                console.log('PaymentSuccessScreen: Retrying after not_initiated...');
                setRetryCount(prev => prev + 1);
                fetchLatestPayment();
            }, 3000);
            return () => clearTimeout(retryTimer);
        } else {
            // Either not from registration, or max retries reached, or genuinely failed
            console.log('PaymentSuccessScreen: ❌ Redirecting to failed screen (retries exhausted or failed status)');
            navigation.replace(ScreenNames.PaymentFailed);
        }
    }, [recentOrder, isLoading, navigation, route.params, retryCount, fetchLatestPayment, MAX_RETRIES]);

    const handleGoHome = () => {
        replaceToMain(ScreenNames.Home);
    };

    const handleDownloadExam = async () => {
        const id = recentOrder?.payment_id;
        if (id) {
            try {
                // console.log('Download Exam PDF', id);
                const fileName = `invoice-${recentOrder.student_registration_id}`;
                await OtherService.downloadInvoice(id, fileName);
                Alert.alert('Success', 'Invoice downloaded successfully.');
            } catch (error) {
                console.error('Download failed:', error);
                Alert.alert('Error', 'Failed to download invoice. Please try again.');
            }
        } else {
            Alert.alert('Error', 'Invoice not available for this order.');
        }
    };

    const handleEmailExam = async () => {
        const registration_id = recentOrder?.registration_id || recentOrder?.id;
        if (registration_id) {
            try {
                const response = await OtherService.emailAdmitCard(registration_id);
                if (response?.status) {
                    Alert.alert('Success', response.message || 'Admit Card emailed successfully.');
                } else {
                    Alert.alert('Error', response?.message || 'Failed to email Admit Card.');
                }
            } catch (error) {
                console.error('Email admit card failed:', error);
                Alert.alert('Error', 'Failed to email Admit Card. Please try again.');
            }
        }
    };

    const handleDownloadAdmitCard = async () => {
        const registration_id = recentOrder?.registration_id || recentOrder?.id;
        if (registration_id) {
            try {
                const fileName = `admit-card-${recentOrder.student_registration_id}`;
                await OtherService.downloadAdmitCard(registration_id, fileName);
                Alert.alert('Success', 'Admit Card downloaded successfully.');
            } catch (error) {
                console.error('Download failed:', error);
                Alert.alert('Error', 'Failed to download Admit Card. Please try again.');
            }
        }
    };

    // Format Date safely
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        // Handle Laravel format "YYYY-MM-DD HH:mm:ss" or standard ISO
        // If it's "YYYY-MM-DD HH:mm:ss", append "T" to make it ISO-like or parse manually
        let dateToParse = dateString;
        if (dateString.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
            dateToParse = dateString.replace(' ', 'T');
        }

        const date = new Date(dateToParse);
        if (isNaN(date.getTime())) return dateString; // Fallback to original string if parse fails

        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Helper to safely get display values
    // Helper to get currency symbol
    const getCurrencySymbol = (currency: string, country?: string) => {
        // 1. Try explicit currency code
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

        // 2. Fallback to country mapping
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

        // 3. Last resort fallback
        return '£';
    };

    const currencyCode = recentOrder?.currency;
    const countryName = recentOrder?.country || recentOrder?.country_name;
    const currencySymbol = getCurrencySymbol(currencyCode, countryName);
    const amount = recentOrder?.amount ? `${currencySymbol}${recentOrder.amount}` : `${currencySymbol}0.00`;
    const orderId = recentOrder?.stripe_payment_intent_id;
    // ? `TXN-${recentOrder.stripe_payment_intent_id.slice(-8).toUpperCase()}`
    // : 'TXN-PENDING';
    const paymentDate = recentOrder?.created_at ? formatDate(recentOrder.created_at) : 'Just now';
    const paymentMethod = recentOrder?.payment_method === 'card' ? 'Visa' : recentOrder?.payment_method || 'Card';
    // const last4 = '3456';

    // Show loading state while fetching
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDarkBlue} translucent={false} />
                <ActivityIndicator size="large" color={Colors.primaryBlue} />
                <Text style={{ marginTop: 16, color: Colors.textGray }}>Loading payment details...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDarkBlue} translucent={false} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
            >
                {/* Header Background & Content */}
                <LinearGradient
                    colors={[Colors.primaryDarkBlue, '#0A3A6B']}
                    style={styles.headerBackground}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.iconCircle}>
                            <Icon name="check" size={50} color={'#28a745'} />
                        </View>
                        <Text style={styles.title}>Payment Successful!</Text>
                        <Text style={styles.subtitle}>
                            Your exam registration has been confirmed
                        </Text>

                        {/* Transaction ID Card */}
                        <View style={[styles.transactionCard, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                            <Text style={styles.transactionLabel}>Transaction ID</Text>
                            <Text style={styles.transactionValue} numberOfLines={1}>
                                {orderId || 'TXN-PENDING'}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* White Details Card */}
                <View style={styles.detailsCard}>
                    {/* Payment Info Scalloped Edge Effect not easily doable in RN without SVG, using straight edge for now */}

                    <View style={styles.paymentHeader}>
                        <View style={styles.paymentInfoCol}>
                            <Text style={styles.paymentInfoLabel}>Payment Date</Text>
                            <Text style={styles.paymentInfoValue}>{paymentDate}</Text>
                        </View>
                        <View style={[styles.paymentInfoCol, { alignItems: 'flex-end' }]}>
                            <Text style={styles.paymentInfoLabel}>Amount Paid</Text>
                            <Text style={styles.amountValue}>{amount}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Payment Method & Status */}
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Method</Text>
                        <View style={styles.rowValueContainer}>
                            <Icon name="credit-card" size={20} color={Colors.primaryDarkBlue} style={{ marginRight: 8 }} />
                            <Text style={styles.valueText}>{paymentMethod}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Status</Text>
                        <View style={styles.statusBadge}>
                            <Icon name="check-circle" size={14} color={Colors.white} style={{ marginRight: 4 }} />
                            <Text style={styles.statusText}>Completed</Text>
                        </View>
                    </View>

                    {/* Registration Summary */}
                    <Text style={styles.sectionTitle}>Registration Summary</Text>

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

                    {/* Student Registration ID */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconBox}>
                            <Icon name="clipboard-account" size={24} color={Colors.primaryDarkBlue} />
                        </View>
                        <View style={styles.summaryDetails}>
                            <Text style={styles.summaryLabel}>Student Registration ID</Text>
                            <Text style={styles.summaryValue}>{recentOrder?.student_registration_id || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Exam Center */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconBox}>
                            <Icon name="map-marker" size={24} color={Colors.primaryDarkBlue} />
                        </View>
                        <View style={styles.summaryDetails}>
                            <Text style={styles.summaryLabel}>Exam Center</Text>
                            <Text style={styles.summaryValue}>{recentOrder?.exam_center_name || 'N/A'}</Text>
                            <Text style={styles.summarySubtext}>{recentOrder?.exam_center_address || 'Address not available'}</Text>
                        </View>
                    </View>

                    {/* Payment Breakdown */}
                    <Text style={styles.sectionTitle}>Payment Breakdown</Text>

                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Total</Text>
                        <Text style={styles.breakdownValue}>{amount}</Text>
                    </View>
                    {/* <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Processing Fee</Text>
                        <Text style={styles.breakdownValue}>£0.00</Text>
                    </View> */}
                    {/* <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Tax (VAT 0%)</Text>
                        <Text style={styles.breakdownValue}>£0.00</Text>
                    </View> */}

                    <View style={styles.dashedDivider} />

                    <View style={styles.breakdownRow}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>{amount}</Text>
                    </View>
                    {/* <Text style={styles.paidVia}>Paid via {paymentMethod} ending in {last4}</Text> */}

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleDownloadExam}>
                            <Icon name="download" size={20} color={Colors.white} />
                            <Text style={styles.primaryButtonText}>Download Invoice</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.outlineButton} onPress={handleEmailExam}>
                            <Icon name="email-outline" size={20} color={Colors.primaryDarkBlue} />
                            <Text style={styles.outlineButtonText}>Email Admit Card</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.outlineButton} onPress={handleDownloadAdmitCard}>
                            <Icon name="download" size={20} color={Colors.primaryDarkBlue} />
                            <Text style={styles.outlineButtonText}>Download Admit Card</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.outlineButton} onPress={handleGoHome}>
                            <Icon name="home-outline" size={20} color={Colors.primaryDarkBlue} />
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
        paddingBottom: 60, // Space for overlap
        // flex: 1 is removed
    },
    scrollContent: {
        paddingBottom: Spacing.spacing.xl,
        paddingTop: 0, // Header now handles its own top padding
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: Spacing.spacing.lg,
        paddingTop: 60, // Top padding moved here or kept in container? Let's put it in headerBackground or headerContent
        paddingBottom: 80, // Increased to ensure overlap space
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
    transactionCard: {
        width: '100%',
        borderRadius: Spacing.borderRadius.medium,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        paddingVertical: Spacing.spacing.xl, // Generous padding
        paddingHorizontal: Spacing.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // transactionGradient removed as it is merged into transactionCard
    transactionLabel: {
        fontSize: FontSizes.xs,
        fontFamily: Fonts.InterMedium,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8, // Increased margin
    },
    transactionValue: {
        fontSize: FontSizes.lg,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
        letterSpacing: 1,
        marginTop: 4,
    },
    detailsCard: {
        backgroundColor: '#F5F7FA', // Off-white/light gray background
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -24, // Negative margin to overlap
        paddingHorizontal: Spacing.spacing.lg,
        paddingTop: Spacing.spacing.xl,
        flex: 1,
        minHeight: responsiveScreenHeight(60),
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // backgroundColor: '#6A9BC2', // Removed duplicate
        backgroundColor: '#4E86B0', // Slightly lighter blue than header to distinguish? Or just use same gradient?
        // Actually, let's keep it simple: Payment Date/Amount row inside the WHITE card but styled to pop?
        // In the image provided: "Payment Date" and "Amount Paid" are on a Blue Container with rounded corners top, and scalloped bottom.
        // I will simulate this by making a container inside detailsCard that has a Blue background.
        borderRadius: Spacing.borderRadius.medium,
        padding: Spacing.spacing.lg,
        marginBottom: Spacing.spacing.lg,
    },
    paymentInfoCol: {
        justifyContent: 'center',
    },
    paymentInfoLabel: {
        fontSize: FontSizes.xs,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        fontFamily: Fonts.InterRegular,
    },
    paymentInfoValue: {
        fontSize: FontSizes.md,
        color: Colors.white,
        fontFamily: Fonts.InterBold,
    },
    amountValue: {
        fontSize: FontSizes.xxl,
        color: Colors.white,
        fontFamily: Fonts.InterBold,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: Spacing.spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.spacing.md,
    },
    label: {
        fontSize: FontSizes.sm,
        color: '#6B7280',
        fontFamily: Fonts.InterMedium,
    },
    rowValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: FontSizes.sm,
        color: '#111827',
        fontFamily: Fonts.InterBold,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0E7490', // Ocean blue variant
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        fontSize: FontSizes.xs,
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
        // Shadow
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
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.spacing.sm,
    },
    breakdownLabel: {
        fontSize: FontSizes.sm,
        color: '#6B7280',
        fontFamily: Fonts.InterRegular,
    },
    breakdownValue: {
        fontSize: FontSizes.sm,
        color: '#374151',
        fontFamily: Fonts.InterBold,
    },
    dashedDivider: {
        height: 1,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 1,
        marginVertical: Spacing.spacing.md,
    },
    totalLabel: {
        fontSize: FontSizes.lg,
        color: '#111827',
        fontFamily: Fonts.InterBold,
    },
    totalValue: {
        fontSize: FontSizes.xxl,
        color: '#28a745', // Green for total
        fontFamily: Fonts.InterBold,
    },
    paidVia: {
        fontSize: FontSizes.xs,
        color: '#6B7280',
        marginTop: 4,
        fontFamily: Fonts.InterRegular,
    },
    actionButtonsContainer: {
        marginTop: Spacing.spacing.xl,
        gap: Spacing.spacing.md,
    },
    primaryButton: {
        backgroundColor: '#0C4B8B',
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
        borderColor: '#0C4B8B',
    },
    outlineButtonText: {
        color: '#0C4B8B',
        fontFamily: Fonts.InterBold,
        fontSize: FontSizes.md,
    },
});

export default PaymentSuccessScreen;
