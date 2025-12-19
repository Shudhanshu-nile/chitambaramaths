import { DataType } from '../constants/index';
import { API } from './api/ApiDetails';
import Http from './axios/HttpService';

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
}
export default OtherService;