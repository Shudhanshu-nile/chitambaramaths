import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React from 'react';
import { BlurView } from '@react-native-community/blur';
import {
  Colors,
  FontSizes,
  Spacing,
  Fonts,
  responsiveScreenHeight,
  responsiveScreenWidth,
  ScreenNames,
} from '../constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { replaceToMain } from '../navigation/GlobalNavigation';

const PurchaseSuccessful = ({ navigation, route }: any) => {
  const orderData = route?.params || {
    orderId: '#PHT-2025-0156',
    photosPurchased: 5,
    amountPaid: '£22.94',
  };

  const handleGoHome = () => {
    replaceToMain(ScreenNames.Home);
  };

  const handleDownloadPhotos = () => {
    // Handle download photos logic
    console.log('Download photos');
  };

  const handleDownloadInvoice = () => {
    // Handle download invoice logic
    console.log('Download invoice');
  };

  return (
    <LinearGradient
      colors={[
        Colors.primaryDarkBlue,
        Colors.primaryBlue,
        Colors.white,
        Colors.white,
      ]}
      start={{ x: 1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIconWrapper}>
            <Icon name="check" size={50} color={Colors.primaryBlue} />
          </View>
        </View>

        {/* Success Title */}
        <Text style={styles.successTitle}>Purchase Successful!</Text>
        <Text style={styles.successSubtitle}>
          Your photos are ready to download
        </Text>

        {/* Blue Card with BlurView */}
        <View style={styles.cardContainer}>
          <BlurView
            blurType="thinMaterialLight"
            blurAmount={4}
            style={styles.blurView}
          >
            <View style={styles.cardContent}>
              {/* Order Details */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order ID</Text>
                <Text style={styles.detailValue}>{orderData.orderId}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Photos Purchased</Text>
                <Text style={styles.detailValue}>
                  {orderData.photosPurchased} Photos
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount Paid</Text>
                <Text style={styles.detailValue}>{orderData.amountPaid}</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Download Buttons */}
        <View style={styles.buttonContainer}>
          {/* Download All Photos Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleDownloadPhotos}
            activeOpacity={0.8}
          >
            <Icon name="download" size={20} color={Colors.white} />
            <Text style={styles.primaryButtonText}>Download All Photos</Text>
          </TouchableOpacity>

          {/* Download Invoice Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleDownloadInvoice}
            activeOpacity={0.8}
          >
            <Icon name="file-document" size={18} color={Colors.primaryBlue} />
            <Text style={styles.secondaryButtonText}>Download Invoice</Text>
          </TouchableOpacity>
        </View>

        {/* Go Home Button */}
        <TouchableOpacity
          style={styles.goHomeButton}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Icon name="home" size={20} color={Colors.white} />
          <Text style={styles.goHomeButtonText}>Go Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: Spacing.spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: responsiveScreenHeight(2),
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: FontSizes.xxxl,
    fontFamily: Fonts.InterBold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.spacing.sm,
  },
  successSubtitle: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.InterRegular,
    color: Colors.whiteOverlay80,
    textAlign: 'center',
    marginBottom: responsiveScreenHeight(0.5),
  },
  cardContainer: {
    marginVertical: responsiveScreenHeight(2),
    borderRadius: Spacing.borderRadius.large,
    overflow: 'hidden',
    paddingHorizontal: Spacing.spacing.lg,
  },
  blurView: {
    borderRadius: Spacing.borderRadius.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardContent: {
    padding: Spacing.spacing.lg,
    backgroundColor: 'rgba(12, 75, 139, 0.4)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.spacing.md,
  },
  detailLabel: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.InterMedium,
    color: Colors.whiteOverlay80,
  },
  detailValue: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.InterBold,
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Spacing.spacing.sm,
  },
  buttonContainer: {
    marginTop: responsiveScreenHeight(1),
    gap: Spacing.spacing.md,
    marginHorizontal: Spacing.spacing.lg,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.spacing.lg,
    borderRadius: Spacing.borderRadius.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    width: '90%',
    backgroundColor: Colors.primaryDarkBlue,
    borderRadius: Spacing.borderRadius.medium,
    paddingVertical: Spacing.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.InterBold,
    color: Colors.white,
  },
  secondaryButton: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: Spacing.borderRadius.medium,
    paddingVertical: Spacing.spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBlue,
  },
  secondaryButtonText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.InterBold,
    color: Colors.primaryBlue,
  },
  goHomeButton: {
    marginHorizontal: Spacing.spacing.lg,
    backgroundColor: Colors.primaryBlue,
    borderRadius: Spacing.borderRadius.medium,
    paddingVertical: Spacing.spacing.lg,
    marginTop: responsiveScreenHeight(3),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.spacing.md,
    marginBottom: responsiveScreenHeight(2),
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  goHomeButtonText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.InterSemiBold,
    color: Colors.white,
  },
});

export default PurchaseSuccessful;
