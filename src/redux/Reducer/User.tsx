import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import UserAuthService from '../../service/UserAuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string;
    phone?: string;
    dateOfBirth?: string;
    country?: string;
    academicYear?: string;
    isExamCenter?: boolean;
    token?: string;
}

interface UserState {
    user: UserProfile | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    error: string | null;
    registrationData: {
        fullName: string;
        email: string;
        phone: string;
        dob: string;
        password: string;
        confirmPassword: string;
        country: string;
        academicYear: string;
        isExamCenter: boolean;
        agreeToTerms: boolean;
        sendUpdates: boolean;
    };
}

const initialState: UserState = {
    user: null,
    isLoggedIn: false,
    isLoading: false,
    error: null,
    registrationData: {
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        password: '',
        confirmPassword: '',
        country: 'UK',
        academicYear: '',
        isExamCenter: true,
        agreeToTerms: false,
        sendUpdates: false,
    },
};

// Async Thunks
export const loginUser = createAsyncThunk(
    'user/login',
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await UserAuthService.signIn(credentials);
            if (response.data.status === true) {
                const apiData = response.data.data || {};
                const user: UserProfile = {
                    id: apiData.id?.toString() || Math.random().toString(36).substr(2, 9),
                    fullName: apiData.name,
                    email: apiData.email,
                    profileImage: apiData.profile_image,
                    phone: apiData.phone || apiData.mobile,
                    dateOfBirth: apiData.date_of_birth,
                    country: apiData.country,
                    academicYear: apiData.year,
                    isExamCenter: apiData.user_type_id === '3', // Assuming 3 is exam center, adjust if known
                    token: response.data.token,
                };

                // Store token for axios interceptors if needed
                if (user.token) {
                    await AsyncStorage.setItem('authToken', user.token);
                }

                return user;
            } else {
                return rejectWithValue(response.data.message || 'Login failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk(
    'user/register',
    async (payload: any, { rejectWithValue }) => {
        try {
            const response = await UserAuthService.register(payload);

            if (response && response.data) {
                const apiData = response.data.data || {};
                const apiToken = response.data.token;

                const user: UserProfile = {
                    id: apiData.id || Math.random().toString(36).substr(2, 9),
                    fullName: apiData.name || payload.name,
                    email: apiData.email || payload.email,
                    phone: payload.phone,
                    dateOfBirth: payload.date_of_birth,
                    country: payload.country,
                    academicYear: apiData.year || payload.year,
                    token: apiToken,
                };

                if (user.token) {
                    await AsyncStorage.setItem('authToken', user.token);
                }

                return user;
            } else {
                return rejectWithValue('Registration failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logout',
    async (_, { rejectWithValue }) => {
        try {
            await UserAuthService.logout();
            await AsyncStorage.removeItem('authToken');
            return true;
        } catch (error) {
            // Even if API fails, we clear local state
            await AsyncStorage.removeItem('authToken');
            return true;
        }
    }
);

export const UserSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateRegistrationField: (state, action: PayloadAction<{ field: string; value: any }>) => {
            const { field, value } = action.payload;
            // @ts-ignore
            state.registrationData[field] = value;
        },
        resetRegistrationForm: (state) => {
            state.registrationData = initialState.registrationData;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = true;
            state.user = action.payload;
            state.error = null;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = false;
            state.user = null;
            state.error = action.payload as string;
        });

        // Register
        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = true;
            state.user = action.payload;
            state.error = null;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isLoggedIn = false;
            state.user = null;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.isLoggedIn = false;
            state.user = null;
            state.isLoading = false;
        });
    }
});

export const { updateRegistrationField, resetRegistrationForm, clearError } = UserSlice.actions;
export default UserSlice.reducer;
