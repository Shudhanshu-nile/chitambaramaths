//external imports
import axios from 'axios';
import { Linking } from 'react-native';

class AxiosInterceptor {
  private static reqInterceptor: number;
  private static resInterceptor: number;

  // declare a request interceptor
  static subscribeRequest() {
    if (this.reqInterceptor === undefined) {
      this.reqInterceptor = axios.interceptors.request.use(
        (config: any) => {
          // perform a task before the request is sent
          console.log('request sent on!', config.url);

          return config;
        },
        (error: any) => {
          // handle error
          return Promise.reject(error);
        },
      );
    }
  }

  // declare a response interceptor
  static subscribeResponse() {
    if (this.resInterceptor === undefined) {
      this.resInterceptor = axios.interceptors.response.use(
        (response: any) => {
          return response;
        },
        (error: any) => {
          // handle the response error
          if (error.response) {
            const data = error.response.data;
            console.log('API ERROR RESPONSE (NEW):', JSON.stringify(data, null, 2));

            if (data?.repayment_url) {
              console.log('Attempting to open repayment URL:', data.repayment_url);
              Linking.openURL(data.repayment_url)
                .then(() => console.log('Successfully opened URL'))
                .catch((err) => console.error('An error occurred opening URL:', err));
            } else {
              console.log('No repayment_url found in error response');
            }
          } else {
            console.log('API ERROR', error.message, '-->', error.config.url);
          }

          return Promise.reject(error);
        },
      );
    }
  }
}

export default AxiosInterceptor;
