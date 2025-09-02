import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const orderApi = createApi({
	reducerPath: 'orderApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${REACT_APP_BACKEND_URL}/order`,
		credentials: 'include',
	}),
	tagTypes: ['User'],
	endpoints: (builder) => ({
		getUserChatOrders: builder.query({
			query: (userId) => `/chat/${userId}`,
			providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
		}),
		getAstroChatOrders: builder.query({
			query: (astroId) => `/chat/astro/${astroId}`,
			providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
		}),
		createOrder: builder.mutation({
			query: ({ userId, astroId, duration, deduction, chatId, earnings }) => {
				return {
					url: `/chat`,
					method: 'POST',
					body: { userId, astroId, duration, deduction, chatId, earnings },
					credentials: 'include',
				};
			},
		}),
	}),
});

export const { useGetUserChatOrdersQuery, useGetAstroChatOrdersQuery, useCreateOrderMutation } = orderApi;
