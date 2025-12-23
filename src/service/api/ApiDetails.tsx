// const DOMAIN = 'https://niletechinnovations.com/projects/chitambramaths/api/'; //  server dev
const DOMAIN = 'https://app.chithambaramaths.com/api/'; // live server

export const API = {
  LOGIN: DOMAIN + `login`,
  EXAM_REGISTER: DOMAIN + 'exam-registration',
  GET_COUNTRIES: DOMAIN + 'countries',
  GET_EXAM_CENTERS: DOMAIN + 'exam-centers',
  GET_STUDY_YEARS: DOMAIN + 'study-years',
  REGISTER: DOMAIN + 'register',
  LOGOUT: DOMAIN + 'logout',
  FORGOT_PASSWORD: DOMAIN + 'forgot-password',
  VERIFY_OTP: DOMAIN + 'verify-otp',
  RESET_PASSWORD: DOMAIN + 'reset-password',
  RESEND_OTP :DOMAIN + 'resend-otp',
  UPDATE_PROFILE: DOMAIN + 'update-profile',
};
