
import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
    Colors,
    FontSizes,
    Spacing,
    Fonts,
    responsiveScreenHeight,
    responsiveScreenWidth,
    ScreenNames,
} from '../constants';
import { fetchPaymentHistory } from '../redux/Reducer/Payment';
import { replaceToMain } from '../navigation/GlobalNavigation';

const { width } = Dimensions.get('window');

const PaymentSuccessScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const { history, isLoading } = useSelector((state: any) => state.payment);
    const { user } = useSelector((state: any) => state.user);

    // Fetch only the latest payment history
    useEffect(() => {
        dispatch(fetchPaymentHistory(1) as any);
    }, [dispatch]);

    // Get the most recent order effectively
    const recentOrder = history && history.length > 0 ? history[0] : null;

    const handleGoHome = () => {
        replaceToMain(ScreenNames.Home);
    };

    const handleDownloadExam = () => {
        console.log('Download Exam PDF');
    };

    const handleEmailExam = () => {
        console.log('Email Exam PDF');
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
    const amount = recentOrder?.amount ? `£${recentOrder.amount}` : '£0.00';
    const orderId = recentOrder?.stripe_payment_intent_id;
    // ? `TXN-${recentOrder.stripe_payment_intent_id.slice(-8).toUpperCase()}`
    // : 'TXN-PENDING';
    const paymentDate = recentOrder?.created_at ? formatDate(recentOrder.created_at) : 'Just now';
    const paymentMethod = recentOrder?.payment_method === 'card' ? 'Visa' : recentOrder?.payment_method || 'Card';
    const last4 = '3456';

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
                            <Text style={styles.valueText}>•••• {last4}</Text>
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
                            <Text style={styles.summaryValue}>{user?.fullName || 'Student'}</Text>
                        </View>
                    </View>

                    {/* Exam Session */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconBox}>
                            <Icon name="calendar-month" size={24} color={Colors.primaryDarkBlue} />
                        </View>
                        <View style={styles.summaryDetails}>
                            <Text style={styles.summaryLabel}>Exam Session</Text>
                            <Text style={styles.summaryValue}>May/June 2025</Text>
                            <Text style={styles.summarySubtext}>UK Exam 2025</Text>
                        </View>
                    </View>

                    {/* Exam Center */}
                    <View style={styles.summaryItem}>
                        <View style={styles.summaryIconBox}>
                            <Icon name="map-marker" size={24} color={Colors.primaryDarkBlue} />
                        </View>
                        <View style={styles.summaryDetails}>
                            <Text style={styles.summaryLabel}>Exam Center</Text>
                            <Text style={styles.summaryValue}>Westminster Learning Center</Text>
                            <Text style={styles.summarySubtext}>125 Oxford Street, London W1D 2HX</Text>
                            <Text style={styles.summarySubtext}>Distance: 2.3 km</Text>
                        </View>
                    </View>

                    {/* Payment Breakdown */}
                    <Text style={styles.sectionTitle}>Payment Breakdown</Text>

                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Subtotal</Text>
                        <Text style={styles.breakdownValue}>£90.00</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Processing Fee</Text>
                        <Text style={styles.breakdownValue}>£5.00</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Tax (VAT 0%)</Text>
                        <Text style={styles.breakdownValue}>£0.00</Text>
                    </View>

                    <View style={styles.dashedDivider} />

                    <View style={styles.breakdownRow}>
                        <Text style={styles.totalLabel}>Total Paid</Text>
                        <Text style={styles.totalValue}>{amount}</Text>
                    </View>
                    <Text style={styles.paidVia}>Paid via {paymentMethod} ending in {last4}</Text>

                    {/* Action Buttons */}
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleDownloadExam}>
                            <Icon name="download" size={20} color={Colors.white} />
                            <Text style={styles.primaryButtonText}>Download Exam (PDF)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.outlineButton} onPress={handleEmailExam}>
                            <Icon name="email-outline" size={20} color={Colors.primaryDarkBlue} />
                            <Text style={styles.outlineButtonText}>Email Exam (PDF)</Text>
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
