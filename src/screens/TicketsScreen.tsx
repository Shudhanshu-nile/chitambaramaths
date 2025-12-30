import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, StatusBar, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
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

const TicketsScreen = () => {
    const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
    const navigation = useNavigation<any>();
    const { history, isLoading } = useSelector((state: RootState) => state.payment);
    const { isLoggedIn } = useSelector((state: RootState) => state.user);

    const loadOrders = useCallback(() => {
        dispatch(fetchPaymentHistory(1));
    }, [dispatch]);

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

    const renderItem = ({ item }: { item: PaymentItem }) => {
        const date = formatDate(item.created_at);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.orderType}>{item.order_type || 'Exam Registration'}</Text>
                    <Text style={[
                        styles.status,
                        { color: item.status === 'succeeded' || item.status === 'Success' ? Colors.iconGreen : Colors.red }
                    ]}>
                        {item.status}
                    </Text>
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
            </View>
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
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={isLoading} onRefresh={loadOrders} colors={[Colors.primaryBlue]} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No orders found</Text>
                            </View>
                        }
                    />
                )}
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
        // paddingTop: 60,
        paddingBottom: 30,
        // paddingHorizontal: 20, // Handled by inner views
        height: 220,
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
        marginTop: 70,
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
});
