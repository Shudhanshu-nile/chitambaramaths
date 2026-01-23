import React, { useEffect, useCallback, useState } from 'react';
import { StyleSheet, View, Text, StatusBar, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Image, Modal, Alert, Linking, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Logo from '../assets/images/logo.svg';
import { Colors, Gradients, Fonts, ScreenNames } from '../constants';
import { formatDate } from '../utils/DateUtils';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/Reducer/RootReducer';
import { fetchPaymentHistory, PaymentItem } from '../redux/Reducer/Payment';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import OtherService from '../service/OtherService';

const TicketsScreen = () => {
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
    const navigation = useNavigation<any>();
    const { history, isLoading, pagination } = useSelector((state: RootState) => state.payment);
    const { isLoggedIn } = useSelector((state: RootState) => state.user);

    const [sortVisible, setSortVisible] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Country'
    const [filterValue, setFilterValue] = useState('');
    const [countriesList, setCountriesList] = useState<any[]>([]);
    const [childrenList, setChildrenList] = useState<any[]>([]);
    const [downloadingAdmitCardId, setDownloadingAdmitCardId] = useState<string | number | null>(null);
    const [emailingAdmitCardId, setEmailingAdmitCardId] = useState<string | number | null>(null);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | number | null>(null);

    const loadOrders = useCallback(() => {
        dispatch(fetchPaymentHistory(1));
        fetchCountries();
    }, [dispatch]);

    const loadMoreOrders = useCallback(() => {
        if (pagination && pagination.current_page < pagination.last_page && !isLoading) {
            dispatch(fetchPaymentHistory(pagination.current_page + 1));
        }
    }, [dispatch, pagination, isLoading]);

    const fetchCountries = async () => {
        try {
            const response = await OtherService.getCountries();
            if (response?.data?.status && response?.data?.data) {
                setCountriesList(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch countries:', error);
        }
    };

    const fetchChildren = useCallback(async () => {
        try {
            const response = await OtherService.getChildren();

            if (response.data && Array.isArray(response.data)) {
                setChildrenList(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch children for name mapping', error);
        }
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            navigation.navigate(ScreenNames.Login);
        }
    }, [isLoggedIn, navigation]);

    useEffect(() => {
        if (isLoggedIn) {
            loadOrders();
        }
    }, [loadOrders, isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchChildren();
        }
    }, [fetchChildren, isLoggedIn]);

    const processedHistory = React.useMemo(() => {
        let res = [...history];

        // Filter
        if (filterType === 'Country') {
            res = res.filter((item: any) => (item.country_name === filterValue || item.country === filterValue));
        }

        // Sort
        res.sort((a: any, b: any) => {
            switch (sortBy) {
                case 'newest':
                    return (b.registration_id || b.id || 0) - (a.registration_id || a.id || 0);
                case 'oldest':
                    return (a.registration_id || a.id || 0) - (b.registration_id || b.id || 0);
                case 'amount_high':
                    return parseFloat(b.amount || '0') - parseFloat(a.amount || '0');
                case 'amount_low':
                    return parseFloat(a.amount || '0') - parseFloat(b.amount || '0');
                default:
                    return 0;
            }
        });

        return res;
    }, [history, sortBy, filterType, filterValue]);

    const handleEmailInvoice = async (order: any) => {
        const id = order.registration_id || order.id;
        if (id) {
            try {
                const response = await OtherService.emailInvoice(id);
                if (response?.status) {
                    Alert.alert('Success', response.message || 'Invoice emailed successfully.');
                } else {
                    Alert.alert('Error', response?.message || 'Failed to email invoice.');
                }
            } catch (error) {
                console.error('Email invoice failed:', error);
                Alert.alert('Error', 'Failed to email invoice. Please try again.');
            }
        }
    };

    const handleEmailAdmitCard = async (order: any) => {
        const registration_id = order.registration_id || order.id;
        if (registration_id) {
            try {
                setEmailingAdmitCardId(registration_id);
                const response = await OtherService.emailAdmitCard(registration_id);
                if (response?.status) {
                    Alert.alert('Success', response.message || 'Exam Admission Card emailed successfully.');
                } else {
                    Alert.alert('Error', response?.message || 'Failed to email Exam Admission Card.');
                }
            } catch (error) {
                console.error('Email Exam Admission Card failed:', error);
                Alert.alert('Error', 'Failed to email Exam Admission Card. Please try again.');
            } finally {
                setEmailingAdmitCardId(null);
            }
        }
    };

    const handleDownloadInvoice = async (order: any) => {
        const id = order.payment_id;
        const regId = order.registration_id || order.id;
        if (id) {
            try {
                setDownloadingInvoiceId(regId);
                const fileName = `invoice-${order.student_registration_id}`;
                await OtherService.downloadInvoice(id, fileName);
                Alert.alert('Success', 'Invoice downloaded successfully.');
            } catch (error) {
                console.error('Download failed:', error);
                Alert.alert('Error', 'Failed to download invoice. Please try again.');
            } finally {
                setDownloadingInvoiceId(null);
            }
        } else {
            Alert.alert('Error', 'Invoice not available for this order.');
        }
    };

    const handleDownloadAdmitCard = async (order: any) => {
        const registration_id = order?.registration_id || order?.id;
        if (registration_id) {
            try {
                setDownloadingAdmitCardId(registration_id);
                const fileName = `admit-card-${order.student_registration_id}`;
                await OtherService.downloadAdmitCard(registration_id, fileName);
                Alert.alert('Success', 'Exam Admission Card downloaded successfully.');
            } catch (error) {
                console.error('Download failed:', error);
                Alert.alert('Error', 'Failed to download Exam Admission Card. Please try again.');
            } finally {
                setDownloadingAdmitCardId(null);
            }
        }
    };

    const handlePayAgain = async (url: string) => {
        if (url) {
            try {
                await Linking.openURL(url);
            } catch (err) {
                console.error('An error occurred', err);
                Alert.alert('Error', 'Cannot open payment link.');
            }
        } else {
            // Fallback to old behavior if no URL? Or just show error?
            // User request implies we should use the URL.
            navigation.navigate(ScreenNames.RegisterExam);
        }
    };

    const renderItem = ({ item }: { item: PaymentItem }) => {
        const date = formatDate(item.created_at);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.orderType}>{item.order_type || 'Exam Registration'}</Text>
                        <Text style={{ fontSize: 12, color: '#666', fontFamily: Fonts.InterRegular, marginTop: 2 }}>{item.country_name}</Text>
                    </View>
                    <Text style={[
                        styles.status,
                        { color: ((item.payment_status || item.status) === 'succeeded' || (item.payment_status || item.status) === 'Success' || (item.payment_status || item.status) === 'success') ? Colors.iconGreen : Colors.red }
                    ]}>
                        {(item.payment_status || item.status) === 'not_initiated' ? 'Failed' : (item.payment_status || item.status || 'Pending')}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Student Name:</Text>
                    <Text style={[styles.value, { textTransform: 'capitalize' }]}>
                        {childrenList.find((c: any) => c.id == item.child_id)?.name || item.child_name || 'N/A'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Student ID:</Text>
                    <Text style={styles.value}>{item.student_registration_id || 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{date}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.amount}>{item.amount ? `${item.amount} ${item.currency ? item.currency.toUpperCase() : ''}` : 'N/A'}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={[styles.value, { textTransform: 'capitalize' }]}>
                        {item.payment_method ? (item.payment_method === 'card' ? 'Card' : item.payment_method) : 'N/A'}
                    </Text>
                </View>

                {(item.payment_status === 'success' || item.status === 'success' || item.status === 'succeeded') ? (
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.invoiceBtn, (emailingAdmitCardId === (item.registration_id || item.id)) && { opacity: 0.5 }]}
                            onPress={() => handleEmailAdmitCard(item)}
                            disabled={emailingAdmitCardId === (item.registration_id || item.id)}
                        >
                            <Icon
                                name="email-outline"
                                size={18}
                                color="#005884"
                            />
                            <Text style={styles.invoiceBtnText}>
                                {emailingAdmitCardId === (item.registration_id || item.id) ? 'Emailing...' : 'Email Exam Admission Card'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.invoiceBtn, (downloadingAdmitCardId === (item.registration_id || item.id)) && { opacity: 0.5 }]}
                            onPress={() => handleDownloadAdmitCard(item)}
                            disabled={downloadingAdmitCardId === (item.registration_id || item.id)}
                        >
                            <Icon
                                name="download"
                                size={18}
                                color="#005884"
                            />
                            <Text style={styles.invoiceBtnText}>
                                {downloadingAdmitCardId === (item.registration_id || item.id) ? 'Downloading...' : 'Download Exam Admission Card'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.downloadBtn, (downloadingInvoiceId === (item.registration_id || item.id)) && { opacity: 0.5 }]}
                            onPress={() => handleDownloadInvoice(item)}
                            disabled={downloadingInvoiceId === (item.registration_id || item.id)}
                        >
                            <Icon name="download" size={18} color="white" />
                            <Text style={styles.downloadBtnText}>
                                {downloadingInvoiceId === (item.registration_id || item.id) ? 'Downloading...' : 'Download Invoice'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    ((item.payment_status || item.status) === 'failed' || (item.payment_status || item.status) === 'not_initiated') && (
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={styles.downloadBtn}
                                onPress={() => handlePayAgain(item.payment_url || '')}
                            >
                                <Icon name="refresh" size={18} color="white" />
                                <Text style={styles.downloadBtnText}>Pay Again</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}
            </View >
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlue} />

            <LinearGradient colors={Gradients.primaryBlue} style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.logoPill}>
                        <Logo height={36} width={176} />
                    </View>

                    {/* <TouchableOpacity style={styles.notificationBtn}>
                        <Icon name="bell" size={22} color="#fff" />
                        <View style={styles.notificationDot} />
                    </TouchableOpacity> */}
                </View>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterBtn, filterType !== 'All' && styles.filterBtnActive]}
                        onPress={() => setFilterVisible(true)}
                    >
                        <Icon name="filter-variant" size={16} color={filterType !== 'All' ? Colors.primaryBlue : "#666"} />
                        <Text style={[styles.filterBtnText, filterType !== 'All' && { color: Colors.primaryBlue }]}>
                            {filterType === 'All' ? 'Filter' : filterValue}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterBtn, sortBy !== 'newest' && styles.filterBtnActive]}
                        onPress={() => setSortVisible(true)}
                    >
                        <Icon name="sort" size={16} color={sortBy !== 'newest' ? Colors.primaryBlue : "#666"} />
                        <Text style={[styles.filterBtnText, sortBy !== 'newest' && { color: Colors.primaryBlue }]}>Sort</Text>
                    </TouchableOpacity>
                </View>

                {!isLoggedIn ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="lock-outline" size={64} color={Colors.gray} style={{ marginBottom: 16 }} />
                        <Text style={[styles.emptyText, { marginBottom: 24, paddingHorizontal: 40, textAlign: 'center' }]}>
                            Please login to see your recent orders
                        </Text>
                        <TouchableOpacity
                            style={{
                                backgroundColor: Colors.primaryBlue,
                                paddingHorizontal: 32,
                                paddingVertical: 12,
                                borderRadius: 12,
                            }}
                            onPress={() => navigation.navigate(ScreenNames.Login)}
                        >
                            <Text style={{ color: Colors.white, fontFamily: Fonts.InterSemiBold, fontSize: 16 }}>
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : isLoading && history.length === 0 ? (
                    <ActivityIndicator size="large" color={Colors.primaryBlue} />
                ) : (
                    <FlatList
                        data={processedHistory}
                        renderItem={renderItem}
                        keyExtractor={(item) => (item.registration_id || item.id || Math.random()).toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={loadOrders} colors={[Colors.primaryBlue]} />
                        }
                        showsVerticalScrollIndicator={false}
                        onEndReached={loadMoreOrders}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={
                            isLoading && history.length > 0 ? (
                                <ActivityIndicator size="small" color={Colors.primaryBlue} style={{ paddingVertical: 20 }} />
                            ) : null
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No orders found</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Filter Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={filterVisible}
                onRequestClose={() => setFilterVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setFilterVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={[styles.modalTitle, { marginBottom: 0 }]}>Filter Orders</Text>
                            <TouchableOpacity onPress={() => {
                                setFilterType('All');
                                setFilterValue('');
                                setFilterVisible(false);
                            }}>
                                <Text style={{ color: Colors.primaryBlue, fontFamily: Fonts.InterMedium, fontSize: 14 }}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={[{ name: 'All', id: 'all' }, ...countriesList]}
                            keyExtractor={(item) => `country-${item.id || item.name}`}
                            style={{ maxHeight: 400 }}
                            renderItem={({ item }) => {
                                const isAll = item.name === 'All';
                                const isActive = isAll ? filterType === 'All' : (filterType === 'Country' && filterValue === item.name);
                                return (
                                    <TouchableOpacity
                                        style={[styles.modalOption, isActive && styles.activeModalOption]}
                                        onPress={() => {
                                            if (isAll) {
                                                setFilterType('All');
                                                setFilterValue('');
                                            } else {
                                                setFilterType('Country');
                                                setFilterValue(item.name);
                                            }
                                            setFilterVisible(false);
                                        }}
                                    >
                                        <Text style={[styles.modalOptionText, isActive && styles.activeModalOptionText]}>{item.name}</Text>
                                        {isActive && <Icon name="check" size={20} color={Colors.primaryBlue} />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Sort Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={sortVisible}
                onRequestClose={() => setSortVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSortVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={[styles.modalTitle, { marginBottom: 0 }]}>Sort Orders</Text>
                            <TouchableOpacity onPress={() => {
                                setSortBy('newest');
                                setSortVisible(false);
                            }}>
                                <Text style={{ color: Colors.primaryBlue, fontFamily: Fonts.InterMedium, fontSize: 14 }}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        {[
                            { label: 'Date: Newest First', value: 'newest' },
                            { label: 'Date: Oldest First', value: 'oldest' },
                            { label: 'Price: High to Low', value: 'amount_high' },
                            { label: 'Price: Low to High', value: 'amount_low' },
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.modalOption,
                                    sortBy === option.value && styles.activeModalOption
                                ]}
                                onPress={() => {
                                    setSortBy(option.value);
                                    setSortVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.modalOptionText,
                                    sortBy === option.value && styles.activeModalOptionText
                                ]}>{option.label}</Text>
                                {sortBy === option.value && (
                                    <Icon name="check" size={20} color={Colors.primaryBlue} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
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
        // paddingTop: 60,
        paddingBottom: 30,
        // paddingHorizontal: 20, // Handled by inner views
        height: Platform.OS === 'ios' ? 200 : 160,

    },
    headerTop: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoPill: {
        backgroundColor: Colors.white,
        height: 50,
        paddingHorizontal: 16,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        // width: 208, // Removed fixed width to prevent clipping
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.whiteOverlay20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 70,
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
    headerTitleContainer: {
        marginTop: 13,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: Fonts.InterBold,
        color: Colors.white,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderGray,
        paddingBottom: 8,
    },
    orderType: {
        fontSize: 16,
        fontFamily: Fonts.InterBold,
        color: Colors.primaryDarkBlue,
    },
    status: {
        fontSize: 14,
        fontFamily: Fonts.InterBold,
        textTransform: 'capitalize',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: Fonts.InterRegular,
        color: Colors.gray,
    },
    value: {
        fontSize: 14,
        fontFamily: Fonts.InterSemiBold,
        color: Colors.black,
    },
    amount: {
        fontSize: 16,
        fontFamily: Fonts.InterBold,
        color: Colors.primaryBlue,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: Fonts.InterRegular,
        color: Colors.gray,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 10,
        gap: 10,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterBtnActive: {
        borderColor: Colors.primaryBlue,
        backgroundColor: '#F0F9FF',
    },
    filterBtnText: {
        fontSize: 12,
        fontFamily: Fonts.InterMedium,
        color: '#666',
        marginLeft: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        maxHeight: 500,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: Fonts.InterBold,
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activeModalOption: {
        // backgroundColor: '#F5F9FF',
    },
    modalOptionText: {
        fontSize: 16,
        fontFamily: Fonts.InterRegular,
        color: '#333',
    },
    activeModalOptionText: {
        fontFamily: Fonts.InterBold,
        color: Colors.primaryBlue,
    },
    actionButtonsContainer: {
        marginTop: 12,
        flexDirection: 'column', // Stacked vertically based on user request/design
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#005884',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    downloadBtnText: {
        color: 'white',
        fontSize: 13,
        fontFamily: Fonts.InterSemiBold,
        marginLeft: 6,
    },
    invoiceBtn: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#005884',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    invoiceBtnText: {
        color: '#005884',
        fontSize: 13,
        fontFamily: Fonts.InterSemiBold,
        marginLeft: 6,
    },
});
