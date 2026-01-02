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

  public static async getExamCenters(countryId: any) {
    const url = `${API.GET_EXAM_CENTERS}/${countryId}`;
    const response = await Http.get(url);
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

    let RootDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
    let path = `${RootDir}/${fileName}.pdf`;

    let options = {
      fileCache: true,
      path: path,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: path,
        description: 'Downloading Invoice',
        mime: 'application/pdf',
        mediaScannable: true,
      },
    };

    try {
      const res = await config(options).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
      });

      if (Platform.OS === 'ios') {
        ios.previewDocument(res.path());
      }
      return res;
    } catch (error) {
      console.error("Download Error", error);
      throw error;
    }
  }

  public static async downloadAdmitCard(id: any, fileName: string) {
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

    let RootDir = Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
    let path = `${RootDir}/${fileName}.pdf`;

    let options = {
      fileCache: true,
      path: path,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: path,
        description: 'Downloading Admit Card',
        mime: 'application/pdf',
        mediaScannable: true,
      },
    };

    try {
      const res = await config(options).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
      });

      if (Platform.OS === 'ios') {
        ios.previewDocument(res.path());
      }
      return res;
    } catch (error) {
      console.error("Download Error", error);
      throw error;
    }
  }
}
export default OtherService;