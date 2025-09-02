import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    loading: false,
    session: null,
};

export const userReducer = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userExist: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.session = action.payload.session;
        },
        userNotExist: (state) => {
            state.loading = false;
            state.user = null;
            state.session = null;
        },
    },
});

export const { userExist, userNotExist } = userReducer.actions;