import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import OtherService from '../../service/OtherService';
import { logoutUser } from './User';

export interface PaymentItem {
    id?: number; // Optional as API seems to return registration_id
    registration_id: number;
    amount: number;
    currency: string;
    country_name: string;
    order_type?: string;
    payment_method: string;
    payment_status?: string; // Add payment_status
    payment_url?: string;
    status: string;
    created_at: string;
    exam_registration_id: number;
    stripe_payment_intent_id: string;
    student_registration_id: string;
    exam_center_name?: string;
    exam_center_address?: string;
    country?: string;
}

export interface PaginationData {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface PaymentState {
    history: PaymentItem[];
    pagination: PaginationData | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: PaymentState = {
    history: [],
    pagination: null,
    isLoading: false,
    error: null,
};

export const fetchPaymentHistory = createAsyncThunk(
    'payment/fetchHistory',
    async (page: number = 1, { rejectWithValue }) => {
        try {
            const response = await OtherService.getPaymentHistory(page);
            if (response.data && response.data.status) {
                return response.data.data; // This contains both 'data' (array) and pagination fields
            } else {
                return rejectWithValue(response.data.message || 'Failed to fetch payment history');
            }
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Failed to fetch payment history'
            );
        }
    }
);

export const PaymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        clearPaymentError: (state) => {
            state.error = null;
        },
        resetPaymentState: (state) => {
            state.history = [];
            state.pagination = null;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPaymentHistory.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(fetchPaymentHistory.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;

            const payload = action.payload;
            if (payload.current_page === 1) {
                state.history = payload.data;
            } else {
                // Append for pagination if needed, or just replace for simple paged view
                // For infinite scroll, we'd append. Let's append if page > 1
                state.history = [...state.history, ...payload.data];
            }

            state.pagination = {
                current_page: payload.current_page,
                from: payload.from,
                last_page: payload.last_page,
                per_page: payload.per_page,
                to: payload.to,
                total: payload.total,
            };
        });
        builder.addCase(fetchPaymentHistory.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Listen for logout action from User slice
        builder.addCase(logoutUser.fulfilled, (state) => {
            state.history = [];
            state.pagination = null;
            state.isLoading = false;
            state.error = null;
        });
    },
});

export const { clearPaymentError, resetPaymentState } = PaymentSlice.actions;
export default PaymentSlice.reducer;
