import { DataType } from '../constants/index';
import { API } from './api/ApiDetails';
import Http from './axios/HttpService';
import ReactNativeBlobUtil from 'react-native-blob-util';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

class OtherService {
  public static async registerExam(Details: any) {
    const dataType = DataType.FORMDATA;
    const url = `${API.EXAM_REGISTER}`;
    const response = await Http.post(url, Details, dataType);
    return response;
  }

  public static async getCountries() {
    const url = `${API.GET_COUNTRIES}`;
    const response = await Http.get(url);
    return response;
  }

  public static async getBanners() {
    const url = `${API.GET_BANNERS}`;
    const response = await Http.get(url);
    return response;
  }

  public static async getChildren() {
    const url = `${API.GET_CHILDREN}`;
    const response = await Http.get(url);
    return response;
  }

  public static async getExamCenters(countryId: any) {
    const url = `${API.GET_EXAM_CENTERS}/${countryId}`;
    const response = await Http.get(url);
    return response;
  }

  public static async getNearestExamCenters(data: any) {
    const dataType = DataType.FORMDATA;
    const url = `${API.NEAREST_EXAM_CENTERS}`;
    const response = await Http.post(url, data, dataType);
    return response;
  }

  public static async getStudyYears(countryId: any) {
    const url = `${API.GET_STUDY_YEARS}/${countryId}`;
    const response = await Http.get(url);
    return response;
  }

  public static async getPaymentHistory(page: number = 1) {
    const url = `${API.PAYMENT_HISTORY}?page=${page}`;
    const response = await Http.get(url);
    return response;
  }

  public static async getTermsAndConditions() {
    const url = `${API.TERMS_AND_CONDITIONS}`;
    const response = await Http.get(url);
    return response;
  }

  public static async getPrivacyPolicy() {
    const url = `${API.PRIVACY_POLICY}`;
    const response = await Http.get(url);
    return response;
  }

  public static async emailInvoice(id: any) {
    const url = `${API.PAYMENTS}/${id}/email-invoice`;
    const response = await Http.get(url);
    return response;
  }

  public static async emailAdmitCard(registration_id: any) {
    const url = `${API.EMAIL_ADMIT_CARD}/${registration_id}`;
    const response = await Http.get(url);
    return response;
  }

  public static async downloadInvoice(id: any, fileName: string) {
    // Sanitize filename
    const safeFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
    // 1. Permission check for Android (legacy)
    if (Platform.OS === 'android') {
      try {
        if ((Platform.Version as number) < 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'App needs access to your storage to download the invoice',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Storage permission denied');
            return;
          }
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const url = `${API.DOWNLOAD_INVOICE}/${id}`;
    const token = await AsyncStorage.getItem('authToken');
    const { config, fs, ios } = ReactNativeBlobUtil;

    // 2. Determine paths
    const isAndroid = Platform.OS === 'android';
    const downloadDir = isAndroid ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    const cacheDir = fs.dirs.CacheDir;

    // Use a temp path for the initial download on Android
    const tempPath = isAndroid ? `${cacheDir}/${safeFileName}.pdf` : `${downloadDir}/${safeFileName}.pdf`;

    const options = {
      fileCache: true,
      path: tempPath,
    };

    try {
      // 3. Fetch with headers
      const res = await config(options).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
      });

      // 4. On Android, use MediaCollection to copy to Downloads
      if (isAndroid) {
        try {
          const mimeType = 'application/pdf';
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: safeFileName, // Automatically handles duplicate names by appending (1), (2) etc.
              parentFolder: '', // Empty means 'Downloads' root
              mimeType: mimeType,
            },
            'Download',
            res.path()
          );

          // Delete temp file after copy
          if (await fs.exists(res.path())) {
            await fs.unlink(res.path());
          }

          console.log("File saved via MediaCollection");
        } catch (copyError) {
          console.error("MediaCollection copy failed", copyError);
          throw copyError;
        }
      } else {
        // iOS
        if (Platform.OS === 'ios') {
          ios.previewDocument(res.path());
        }
      }

      return res;
    } catch (error) {
      console.error("Download Error", error);
      throw error;
    }
  }

  public static async downloadAdmitCard(id: any, fileName: string) {
    // Sanitize filename
    const safeFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');

    if (Platform.OS === 'android') {
      try {
        if ((Platform.Version as number) < 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'App needs access to your storage to download the admit card',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Storage permission denied');
            return;
          }
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const url = `${API.DOWNLOAD_ADMIT_CARD}/${id}`;
    const token = await AsyncStorage.getItem('authToken');
    const { config, fs, ios } = ReactNativeBlobUtil;

    const isAndroid = Platform.OS === 'android';
    const downloadDir = isAndroid ? fs.dirs.DownloadDir : fs.dirs.DocumentDir;
    const cacheDir = fs.dirs.CacheDir;

    // Use a temp path for the initial download on Android
    const tempPath = isAndroid ? `${cacheDir}/${safeFileName}.pdf` : `${downloadDir}/${safeFileName}.pdf`;

    const options = {
      fileCache: true,
      path: tempPath,
    };

    try {
      const res = await config(options).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
      });

      if (isAndroid) {
        try {
          const mimeType = 'application/pdf';
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: safeFileName,
              parentFolder: '',
              mimeType: mimeType,
            },
            'Download',
            res.path()
          );

          if (await fs.exists(res.path())) {
            await fs.unlink(res.path());
          }
        } catch (copyError) {
          console.error("MediaCollection copy failed", copyError);
          throw copyError;
        }
      } else {
        if (Platform.OS === 'ios') {
          ios.previewDocument(res.path());
        }
      }
      return res;
    } catch (error) {
      console.error("Download Error", error);
      throw error;
    }
  }

  public static async getGoogleAddressSuggestions(query: string) {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query,
    )}&key=${API.GOOGLE_MAPS_API_KEY}`;
    // Using simple fetch here since it's an external API, not our backend
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Google Places API Error", error);
      return null;
    }
  }

  public static async getGooglePlaceDetails(placeId: string) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_component,geometry&key=${API.GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Google Place Details API Error", error);
      return null;
    }
  }
}
export default OtherService;