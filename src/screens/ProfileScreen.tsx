import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Gradients, Fonts, ScreenNames } from '../constants';
import Logo from '../assets/images/logo.svg';
import { BlurView } from '@react-native-community/blur';
import { useNavigation } from '@react-navigation/native';
// import { navigate } from '../navigation/GlobalNavigation';
// import { useAuth } from '../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/Reducer/User';
import { fetchPaymentHistory } from '../redux/Reducer/Payment';
import { RootState } from '../redux/Reducer/RootReducer';
import OtherService from '../service/OtherService';

const ProfileScreen = () => {
  // const { signOut } = useAuth();
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.user);
  const { history, isLoading: isOrdersLoading, pagination } = useSelector((state: RootState) => state.payment);
  React.useEffect(() => {
    dispatch(fetchPaymentHistory(1));
  }, [dispatch]);

  // Get only the latest SUCCESSFUL order
  const latestOrder = React.useMemo(() => {
    if (!history || history.length === 0) return null;

    // Filter for successful orders
    const successOrders = history.filter((order: any) => {
      const s = order.payment_status || order.status;
      return s === 'success' || s === 'succeeded' || s === 'Success';
    });

    if (successOrders.length === 0) return null;

    // Sort by ID descending to get the newest successful one
    return [...successOrders].sort((a: any, b: any) => (b.id || 0) - (a.id || 0))[0];
  }, [history]);


  // Fallback to local state if Redux user is null (though validation should prevent access)
  // Or just use Redux user data directly
  const userProfile = {
    name: user?.fullName || 'Guest User',
    email: user?.email || 'guest@example.com',
    profileImage: require('../assets/images/avatar.png'),
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => { }, style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          await dispatch(logoutUser());
          navigation.navigate(ScreenNames.Login);
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEmailInvoice = async (order: any) => {
    if (order?.id) {
      try {
        const response = await OtherService.emailInvoice(order.id);
        if (response?.status) {
          Alert.alert('Success', response.message || 'Admit Card emailed successfully.');
        } else {
          Alert.alert('Error', response?.message || 'Failed to email Admit Card.');
        }
      } catch (error) {
        console.error('Email invoice failed:', error);
        Alert.alert('Error', 'Failed to email Admit Card. Please try again.');
      }
    }
  };

  const handleDownloadInvoice = async (order: any) => {
    if (order?.id) {
      try {
        const fileName = `invoice-${order.student_registration_id}`;
        await OtherService.downloadInvoice(order.id, fileName);
        Alert.alert('Success', 'Invoice downloaded successfully.');
      } catch (error) {
        console.error('Download failed:', error);
        Alert.alert('Error', 'Failed to download invoice. Please try again.');
      }
    }
  };

  const handleDownloadAdmitCard = async (order: any) => {
    if (order?.id) {
      try {
        const fileName = `admit-card-${order.student_registration_id}`;
        await OtherService.downloadAdmitCard(order.exam_registration_id, fileName);
        Alert.alert('Success', 'Admit Card downloaded successfully.');
      } catch (error) {
        console.error('Download failed:', error);
        Alert.alert('Error', 'Failed to download Admit Card. Please try again.');
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => console.log('Deleting account...'),
          style: 'destructive',
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primaryBlue}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
      >
        {/* Header with gradient background */}
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
        </LinearGradient>

        {/* Profile Content */}

        <View style={styles.content}>
          <View style={styles.profileCardHeader}>
            <Text style={styles.profileHeading}>My Profile</Text>
          </View>
          {/* Profile Card with BlurView */}
          {/* Profile Card Container with Edit Icon */}
          <View style={styles.cardContainer}>
            {Platform.OS === 'ios' ? (
              <BlurView
                style={[styles.blurContainer, { overflow: 'hidden' }]}
                blurType="thinMaterialLight"
                blurAmount={4}
                reducedTransparencyFallbackColor="white"
              >
                <View style={styles.profileCard}>
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={userProfile.profileImage}
                      style={styles.profileImage}
                    />
                  </View>

                  <View style={styles.profileInfoContainer}>
                    <Text style={styles.userName}>{userProfile.name}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.userEmail}>{userProfile.email}</Text>
                  </View>
                </View>
              </BlurView>
            ) : (
              <View style={[styles.blurContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)', overflow: 'hidden' }]}>
                <View style={styles.profileCard}>
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={userProfile.profileImage}
                      style={styles.profileImage}
                    />
                  </View>

                  <View style={styles.profileInfoContainer}>
                    <Text style={styles.userName}>{userProfile.name}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.userEmail}>{userProfile.email}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Edit Icon - Placed outside BlurView for better touch handling */}
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => {
                // console.log('Edit icon pressed (outside blur)');
                navigation.navigate(ScreenNames.EditProfile);
              }}
              activeOpacity={0.7}
            >
              <Icon name="pencil" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          {/* <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Icon name="camera" size={24} color="#005884" />
                            <Text style={styles.statValue}>24</Text>
                            <Text style={styles.statLabel}>My Photos</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Icon name="download" size={24} color="#005884" />
                            <Text style={styles.statValue}>48</Text>
                            <Text style={styles.statLabel}>Downloads</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Icon name="ticket-confirmation" size={24} color="#005884" />
                            <Text style={styles.statValue}>3</Text>
                            <Text style={styles.statLabel}>Tickets</Text>
                        </View>
                    </View> */}



          {/* Recent Orders Section */}
          <View style={styles.ordersSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Order</Text>
            </View>

            {/* Active Order Card */}
            {latestOrder && (
              <View key={latestOrder.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderIconBg}>
                    <Icon
                      name={'file-document-outline'}
                      size={24}
                      color={'#2196F3'}
                    />
                  </View>
                  <View style={styles.orderHeaderText}>
                    <Text style={styles.orderTitle}>{latestOrder.order_type}</Text>
                    <Text style={styles.orderSubtitle}>{latestOrder.country_name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.orderPrice}>
                      {latestOrder.currency === 'GBP' ? '£' : latestOrder.currency}
                      {latestOrder.amount}
                    </Text>
                    <Text style={styles.orderDate}>{latestOrder.created_at}</Text>
                  </View>
                </View>

                <Text style={styles.orderId}>Order #{latestOrder.stripe_payment_intent_id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{latestOrder.status}</Text>
                </View>

                <View style={styles.orderMeta}>
                  <View>
                    <Text style={styles.metaLabel}>Payment Method</Text>
                    <Text style={[styles.metaValue, { textTransform: 'capitalize' }]}>{latestOrder.payment_method}</Text>
                  </View>
                  <View>
                    <Text style={styles.metaLabel}>Currency</Text>
                    <Text style={styles.metaValue}>{latestOrder.currency}</Text>
                  </View>
                </View>

                <View style={[styles.orderActions, { flexDirection: 'column' }]}>
                  <TouchableOpacity
                    style={[styles.invoiceBtn, { width: '100%' }]}
                    onPress={() => handleEmailInvoice(latestOrder)}
                  >
                    <Icon
                      name="email-outline"
                      size={18}
                      color="#005884"
                    />
                    <Text style={styles.invoiceBtnText}>Email Admit Card</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.invoiceBtn, { width: '100%' }]}
                    onPress={() => handleDownloadAdmitCard(latestOrder)}
                  >
                    <Icon
                      name="download"
                      size={18}
                      color="#005884"
                    />
                    <Text style={styles.invoiceBtnText}>Download Admit Card</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.downloadBtn, { width: '100%' }]}
                    onPress={() => handleDownloadInvoice(latestOrder)}
                  >
                    <Icon name="download" size={18} color="white" />
                    <Text style={styles.downloadBtnText}>Download Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {/* Sign Out Button */}
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Icon
                name="logout"
                size={20}
                color={Colors.white}
                style={styles.buttonIcon}
              />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>

            {/* Delete Account Button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView >


    </View >
  );
};



export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    height: 380,
    paddingTop: 0,
    zIndex: -999,
    position: 'relative',
  },
  headerTop: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
  },
  logoPill: {
    backgroundColor: Colors.white,
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 208,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.whiteOverlay20,
    alignItems: 'center',
    justifyContent: 'center',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  appTitle: {
    fontSize: 16,
    fontFamily: Fonts.InterBold,
    color: Colors.white,
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.InterRegular,
    color: Colors.whiteOverlay80,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    backgroundColor: Colors.whiteOverlay20,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: -310,
    padding: 20,
    zIndex: 999,
    // paddingBottom: 40,
  },
  profileCard: {
    // backgroundColor: 'rgba(0, 0, 0, 0.01)',
    // borderRadius: 16,
    // padding: 0,
    // marginBottom: 30,
    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.4,
    // shadowRadius: 12,
    // elevation: 3,
    // zIndex:999,
    // overflow: 'visible',
    // borderWidth: 1,
    // borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardContainer: {
    position: 'relative',
    borderRadius: 16,
  },
  editIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 9999, // High z-index
    elevation: 10, // Android elevation
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  blurContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    //   overflow: 'visible',
    // marginTop:20,
    // overflow: 'hidden',
    // marginBottom: 10,
  },
  profileCardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    // backgroundColor: Colors.lightBlue3,
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.borderGray,
  },
  profileHeading: {
    fontSize: 20,
    fontFamily: Fonts.InterBold,
    color: Colors.white,
  },
  profileImageContainer: {
    overflow: 'visible',
    alignItems: 'center',
    marginTop: 10,
    zIndex: 999,
    // paddingVertical: 24,
    // backgroundColor: 'rgba(227, 242, 253, 0.6)',
  },
  profileImage: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    // borderRadius: 50,
    // borderWidth: 4,
    // borderColor: Colors.white,
  },
  profileInfoContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  userName: {
    fontSize: 18,
    fontFamily: Fonts.InterBold,
    color: Colors.white,
    marginBottom: 12,
  },
  divider: {
    width: '90%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 7,
  },
  userEmail: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: Fonts.InterRegular,
    color: Colors.white,
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 20,
  },
  signOutButton: {
    backgroundColor: Colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  signOutButtonText: {
    fontSize: 14,
    fontFamily: Fonts.InterSemiBold,
    color: Colors.white,
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#005884',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: Fonts.InterSemiBold,
    color: '#005884',
    textAlign: 'center',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: Fonts.InterBold,
    color: '#005884',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Fonts.InterRegular,
    color: '#666',
  },



  // Orders Section
  ordersSection: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.InterBold,
    color: '#333',
  },


  // Order Card
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  orderTitle: {
    fontSize: 15,
    fontFamily: Fonts.InterBold,
    color: '#333',
  },
  orderSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.InterRegular,
    color: '#666',
    marginTop: 2,
  },
  orderPrice: {
    fontSize: 16,
    fontFamily: Fonts.InterBold,
    color: '#005884',
  },
  orderDate: {
    fontSize: 11,
    color: '#999',
    fontFamily: Fonts.InterRegular,
    marginTop: 4,
  },
  orderId: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontFamily: Fonts.InterRegular,
  },
  statusBadge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
    display: 'none',
  },
  statusText: {
    fontSize: 10,
    color: '#4CAF50',
    fontFamily: Fonts.InterBold,
  },
  orderMeta: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 20,
  },
  metaLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
    fontFamily: Fonts.InterRegular,
  },
  metaValue: {
    fontSize: 12,
    color: '#333',
    fontFamily: Fonts.InterSemiBold,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#005884',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: 'white',
    fontSize: 13,
    fontFamily: Fonts.InterSemiBold,
    marginLeft: 6,
  },
  invoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#005884',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceBtnText: {
    color: '#005884',
    fontSize: 13,
    fontFamily: Fonts.InterSemiBold,
    marginLeft: 6,
  },

});
