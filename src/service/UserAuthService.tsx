//internal imports
import { DataType } from '../constants/index';
import {API} from './api/ApiDetails';
import Http from './axios/HttpService';

class UserAuthService {
  public static async signInOtp(signInDetails: any) {
    const url = `${API.SIGN_IN}`;
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
    const response = await Http.post(url, signUpDetails,dataType);
    return response;
  }
}

export default UserAuthService;
