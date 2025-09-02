import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getToken } from '../../utils/token';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${REACT_APP_BACKEND_URL}/user`,
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
    searchUser: builder.query({
      query: (userId) => `/profile/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    sendMobileOtp: builder.query({
      query: (phone) => `/send-mobile-otp/${phone}`,
    }),
    verifyMobileOtp: builder.query({
      query: ({ phone, otp }) => `/verify-mobile-otp/${phone}/${otp}`,
    }),
    login: builder.mutation({
      query: ({ email, password, userAgent }) => ({
        url: '/login',
        method: 'POST',
        body: { email, password, userAgent },
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'x-client-type': 'app',
        },
      }),
      invalidatesTags: [{ type: 'User', id: 'CURRENT' }],
    }),

    loginWithMobile: builder.mutation({
      query: ({ phoneNumber, userAgent }) => {
        return {
          url: '/mobile',
          body: {
            phoneNumber,
          },
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
            'x-client-type': 'app',
          },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'CURRENT' }],
    }),
    deleteUserAccount: builder.mutation({
      query: ({ id, userAgent }) => {
        return {
          url: `/delete/${id}`,
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
            'x-client-type': 'app',
          },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'CURRENT' }],
    }),
    isFirstTimeUser: builder.query({
      query: (userId) => `/isFirstTimeUser/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    getUserProfile: builder.query({
      query: (id) => '/profile',
      providesTags: (result, error, search) => [
        { type: 'UserProfile', id: search },
      ],
    }),
    getUserBalance: builder.query({
      query: (id) => `/userId/${id}`,
      providesTags: (result, error, id) => [{ type: 'UserProfile', id }],
    }),
    getUserDetails: builder.query({
      query: (id) => '/getUserDetails',
      providesTags: (result, error, id) => [{ type: 'UserProfile', id }],
    }),
    getUserProfileById: builder.query({
      query: (id) => `/getUserProfileById/${id}`,
      providesTags: (result, error, id) => [{ type: 'UserProfile', id }],
    }),
    followAstrologer: builder.mutation({
      query: ({ userId, astroId }) => {
        return {
          url: '/follow',
          method: 'POST',
          credentials: 'include',
          body: { userId, astroId },
        };
      },
      invalidatesTags: ['User'],
    }),
    unfollowAstrologer: builder.mutation({
      query: ({ userId, astroId }) => {
        return {
          url: '/unfollow',
          method: 'POST',
          credentials: 'include',
          body: { userId, astroId },
        };
      },
      invalidatesTags: ['User'],
    }),
    signUp: builder.mutation({
      query: ({ name, email, phone, password }) => {
        return {
          url: '/register',
          method: 'POST',
          credentials: 'include',
          body: { name, email, phone, password },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    signUpWithGoogle: builder.mutation({
      query: ({ name, email, photo }) => {
        return {
          url: '/google',
          method: 'POST',
          body: { name, email, photo },
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    registerUser: builder.mutation({
      query: ({ name, email, password }) => {
        return {
          url: '/google',
          method: 'POST',
          body: { name, email, password },
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateProfilePic: builder.mutation({
      query: ({ formData }) => {
        return {
          url: '/updatepic',
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateProfile: builder.mutation({
      query: ({
        name,
        gender,
        city,
        state,
        pincode,
        TOB,
        DOB,
        POB,
        pic,
        address,
        phone,
      }) => {
        return {
          url: '/update',
          method: 'POST',
          body: {
            name,
            gender,
            city,
            state,
            pincode,
            TOB,
            DOB,
            POB,
            pic,
            address,
            phone,
          },
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${getToken()}`,
          },
        };
      },
      invalidatesTags: (result, error, { name }) => [
        { type: 'UserProfile', id: name },
      ],
    }),
    saveUserDetails: builder.mutation({
      query: ({ gender, name, birthDate, birthPlace, birthtime, id }) => {
        return {
          url: `/saveUserDetails/${id}`,
          method: 'POST',
          body: { gender, name, birthDate, birthPlace, birthtime, id },
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
        };
      },
      invalidatesTags: (result, error, { name }) => [
        { type: 'UserProfile', id: name },
      ],
    }),
    updateUserBalance: builder.mutation({
      query: ({ userId, amount }) => ({
        url: '/updateBalance',
        method: 'PUT',
        body: { userId, amount },
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'UserProfile', id: userId },
      ],
    }),
    saveExpoToken: builder.mutation({
      query: ({ userId, token }) => ({
        url: '/expo-token',
        method: 'POST',
        body: { userId, token },
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    }),
    sdkLogin: builder.mutation({
      query: ({ email, name, gender, phone, userAgent, fcmToken }) => {
        return {
          url: '/sdk-login',
          method: 'POST',
          body: { email, name, gender, phone, userAgent, fcmToken },
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
          },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'CURRENT' }],
    }),
  }),
});

export const {
  useLazySendMobileOtpQuery,
  useLazyVerifyMobileOtpQuery,
  useSignUpMutation,
  useSignUpWithGoogleMutation,
  useDeleteUserAccountMutation,
  useRegisterUserMutation,
  useSearchUserQuery,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateProfilePicMutation,
  useUpdateProfileMutation,
  useLazyGetUserBalanceQuery,
  useLoginMutation,
  useIsFirstTimeUserQuery,
  useGetUserDetailsQuery,
  useLoginWithMobileMutation,
  useSaveUserDetailsMutation,
  useGetUserProfileByIdQuery,
  useUpdateUserBalanceMutation,
  useFollowAstrologerMutation,
  useUnfollowAstrologerMutation,
  useSaveExpoTokenMutation,
  useSdkLoginMutation,
} = userApi;
