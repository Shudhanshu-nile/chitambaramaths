import { combineReducers } from '@reduxjs/toolkit';
import UserReducer from './User';
import PaymentReducer from './Payment';

export const rootReducer = combineReducers({
    user: UserReducer,
    payment: PaymentReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
