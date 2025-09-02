import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';
import { getToken } from '../../utils/token';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${REACT_APP_BACKEND_URL}`,
    credentials: 'include',
    prepareHeaders: async (headers) => {
      try {
        const token = await getToken();

        if (token) {
          headers.set('Authorization', `${token}`);
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
      return headers;
    },
  }),
  tagTypes: ['Chat', 'Message'],
  endpoints: (builder) => ({
    getAllChats: builder.query({
      query: () => `/chat/all`,
      providesTags: ['Chat'],
    }),
    accessChat: builder.mutation({
      query: (userId) => {
        return {
          url: `/chat`,
          method: 'POST',
          body: { userId },
        };
      },
      providesTags: ['Chat'],
    }),
    getMesseges: builder.query({
      query: ({ chatId, sessionStartTime }) => {
        // Conditionally append sessionStartTime to the URL
        let url = `/message/${chatId}`;
        if (sessionStartTime) {
          url += `?sessionStartTime=${sessionStartTime}`;
        }
        return url;
      },

      providesTags: (result, error, id) => [{ type: 'Message', id }],
    }),
    getSingleChat: builder.mutation({
      query: ({ senderId, receiverId }) => {
        return {
          url: `/getSingleChat`,
          method: 'POST',
          body: {
            senderId,
            receiverId,
          },
        };
      },
      invalidatesTags: ['Message'],
    }),
    sendMessage: builder.mutation({
      query: ({ content, chatId }) => {
        return { url: `/message`, method: 'POST', body: { content, chatId } };
      },
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useGetAllChatsQuery,
  useAccessChatMutation,
  useGetMessegesQuery,
  useLazyGetMessegesQuery,
  useSendMessageMutation,
  useGetSingleChatMutation,
} = chatApi;
