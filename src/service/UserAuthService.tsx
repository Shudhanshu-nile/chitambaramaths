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

  public static async signInVerifyOtp(otpDetails: any) {
    const url = `${API.SIGN_IN_OTP}`;
    const response = await Http.post(url, otpDetails);
    return response;
  }

  public static async signUpOtp(signInDetails: any) {
    const url = `${API.SIGN_UP}`;
    const response = await Http.post(url, signInDetails);
    return response;
  }

  public static async signUpVerifyOtp(otpDetails: any) {
    const url = `${API.SIGN_UP_OTP}`;
    const response = await Http.post(url, otpDetails);
    return response;
  }

  public static async signUpDetails(signUpDetails: any) {
    const url = `${API.SIGN_UP_DETAIL}`;
    const response = await Http.post(url, signUpDetails);
    return response;
  }

  public static async signUpRegister(signUpDetails: any) {
    const dataType = DataType.FORMDATA;
    const url = `${API.SIGN_UP_DETAIL}`;
    const response = await Http.post(url, signUpDetails, dataType);
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

  public static async forgotPassword(Details: any) {
    const url = `${API.FORGOT_PASSWORD}`;
    const response = await Http.post(url, Details);
    return response;
  }

}

export default UserAuthService;
