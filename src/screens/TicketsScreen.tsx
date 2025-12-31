import React, { useEffect, useCallback, useState } from 'react';
import { StyleSheet, View, Text, StatusBar, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Image, Modal, Alert } from 'react-native';
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
    const { history, isLoading } = useSelector((state: RootState) => state.payment);
    const { isLoggedIn } = useSelector((state: RootState) => state.user);

    const [sortVisible, setSortVisible] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const [sortBy, setSortBy] = useState('newest');
    const [filterType, setFilterType] = useState('All'); // 'All', 'Country'
    const [filterValue, setFilterValue] = useState('');
    const [countriesList, setCountriesList] = useState<any[]>([]);

    const loadOrders = useCallback(() => {
        dispatch(fetchPaymentHistory(1));
        fetchCountries();
    }, [dispatch]);

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
                    return (b.id || 0) - (a.id || 0);
                case 'oldest':
                    return (a.id || 0) - (b.id || 0);
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
        if (order?.id) {
            try {
                const response = await OtherService.emailInvoice(order.id);
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

    const handleDownloadInvoice = async (order: any) => {
        if (order?.id) {
            try {
                const fileName = `invoice-${order.student_registration_id}`;
                await OtherService.downloadInvoice(order.id, fileName);
            } catch (error) {
                console.error('Download failed:', error);
                Alert.alert('Error', 'Failed to download invoice. Please try again.');
            }
        }
    };

    const renderItem = ({ item }: { item: PaymentItem }) => {
        const date = formatDate(item.created_at);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderType}>{item.order_type || 'Exam Registration'}</Text>
                    <Text style={[
                        styles.status,
                        { color: (item.status === 'succeeded' || item.status === 'Success' || item.status === 'success') ? Colors.iconGreen : Colors.red }
                    ]}>
                        {item.status}
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
                    <Text style={styles.amount}>{item.amount} {item.currency.toUpperCase()}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={styles.value}>{item.payment_method}</Text>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={styles.invoiceBtn}
                        onPress={() => handleEmailInvoice(item)}
                    >
                        <Icon
                            name="file-document-outline"
                            size={18}
                            color="#005884"
                        />
                        <Text style={styles.invoiceBtnText}>Email Invoice</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.downloadBtn}
                        onPress={() => handleDownloadInvoice(item)}
                    >
                        <Icon name="download" size={18} color="white" />
                        <Text style={styles.downloadBtnText}>Download Invoice</Text>
                    </TouchableOpacity>
                </View>
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
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={loadOrders} colors={[Colors.primaryBlue]} />
                        }
                        showsVerticalScrollIndicator={false}
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
                        <Text style={styles.modalTitle}>Filter Orders</Text>
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
                        <Text style={styles.modalTitle}>Sort Orders</Text>
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
        height: 160,
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
        marginTop: 40,
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
        marginTop: 20,
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
