import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/token';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${REACT_APP_BACKEND_URL}/notification`,
        credentials: 'include',
        prepareHeaders: async (headers) => {
            try {
                const token = await getToken();

                if (token) {
                    headers.set('Authorization', `Bearer ${token}`);
                }
            } catch (error) {
                console.error('Error fetching token:', error);
            }
            return headers;
        },
    }),
    tagTypes: ['User', 'UserProfile'],
    endpoints: (builder) => ({
        saveFirebaseToken: builder.mutation({
            query: ({ userId, token }) => ({
                url: '/firebaseToken',
                method: 'POST',
                body: { userId, token },
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getToken()}`,
                },
            }),
        }),
    }),
});

export const { useSaveFirebaseTokenMutation } = notificationApi;

