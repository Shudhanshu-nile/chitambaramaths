import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
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
    },
});

export const { updateRegistrationField, resetRegistrationForm } = UserSlice.actions;
export default UserSlice.reducer;
