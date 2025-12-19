//external imports
import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

class Axios {
  // get method
  protected static get(
    url: string,
    config?: AxiosRequestConfig | undefined,
  ): Promise<AxiosResponse<any>> {
    return axios.get(url, config);
  }

  // post method
  protected static post(
    url: string,
    data?: any,
    config?: AxiosRequestConfig | undefined,
  ): Promise<AxiosResponse<any>> {
    return axios.post(url, data, config);
  }

  // put method
  protected static put(
    url: string,
    data?: any,
    config?: AxiosRequestConfig | undefined,
  ): Promise<AxiosResponse<any>> {
    return axios.put(url, data, config);
  }

  // delete method
  protected static delete(
    url: string,
    config?: AxiosRequestConfig | undefined,
  ): Promise<AxiosResponse<any>> {
    return axios.delete(url, config);
  }

  protected static all(values: any[]): Promise<any[]> {
    return axios.all(values);
  }
}

export default Axios;
