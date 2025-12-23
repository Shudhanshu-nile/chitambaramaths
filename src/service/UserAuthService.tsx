//internal imports
import { DataType } from '../constants/index';
import { API } from './api/ApiDetails';
import Http from './axios/HttpService';

class UserAuthService {
  public static async signIn(signInDetails: any) {
    const url = `${API.LOGIN}`;
    const response = await Http.post(url, signInDetails);
    return response;
  }

  public static async forgotPassword(Details: any) {
    const dataType = DataType.FORMDATA;
    const url = `${API.FORGOT_PASSWORD}`;
    const response = await Http.post(url, Details, dataType);
    return response;
  }

  public static async ForgotVerifyOtp(otpDetails: any) {
    const dataType = DataType.FORMDATA;
    const url = `${API.VERIFY_OTP}`;
    const response = await Http.post(url, otpDetails, dataType);
    return response;
  }

  public static async resetPassword(Details: any) {
    const dataType = DataType.FORMDATA;
    const url = `${API.RESET_PASSWORD}`;
    const response = await Http.post(url, Details, dataType);
    return response;
  }

  public static async forgotResendOtp(otpDetails: any) {
    const dataType = DataType.FORMDATA;
    const url = `${API.RESEND_OTP}`;
    const response = await Http.post(url, otpDetails, dataType);
    return response;
  }

  public static async register(userData: any) {
    const url = `${API.REGISTER}`;
    const response = await Http.post(url, userData);
    return response;
  }

  public static async logout() {
    const url = `${API.LOGOUT}`;
    const response = await Http.post(url, {});
    return response;
  }

  public static async updateProfile(userData: any) {
    const url = `${API.UPDATE_PROFILE}`;
    const response = await Http.post(url, userData);
    return response;
  }
}

export default UserAuthService;
