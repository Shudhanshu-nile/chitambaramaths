import { combineReducers } from '@reduxjs/toolkit';
import UserReducer from './User';

export const rootReducer = combineReducers({
    user: UserReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
