// const DOMAIN = 'https://niletechinnovations.com/projects/chitambramaths/api/'; //  server dev
const DOMAIN = 'https://app.chithambaramaths.com/api/'; // live server
// const DOMAIN = 'https://staging.chithambaramaths.com/api/'

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
  RESEND_OTP: DOMAIN + 'resend-otp',
  UPDATE_PROFILE: DOMAIN + 'update-profile',
  PAYMENT_HISTORY: DOMAIN + 'payments-history',
  GET_BANNERS: DOMAIN + 'banners',
  DOWNLOAD_INVOICE: DOMAIN + 'download-invoice',
  DOWNLOAD_ADMIT_CARD: DOMAIN + 'download-admit-card',
  EMAIL_ADMIT_CARD: DOMAIN + 'admit-card/email',
  PAYMENTS: DOMAIN + 'payments',
  GET_CHILDREN: DOMAIN + 'children',
  TERMS_AND_CONDITIONS: 'https://app.chithambaramaths.com/terms-condition',
  PRIVACY_POLICY: 'https://app.chithambaramaths.com/privacy-policy',
  DELETE_ACCOUNT: DOMAIN + 'delete-student',
  GOOGLE_MAPS_API_KEY: 'AIzaSyBKJkKVBQoX-8z1c9wcvSXdAmT_iU9kS04',
  NEAREST_EXAM_CENTERS: DOMAIN + 'nearest-exam-centers',
};
