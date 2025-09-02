import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const astrologerApi = createApi({
  reducerPath: 'astrologerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${REACT_APP_BACKEND_URL}/astro`,
  }),
  tagTypes: ['Astrologer', 'AstroProfile'],
  endpoints: (builder) => ({
    getAllAstrologers: builder.query({
      query: ({
        page,
        limit,
        expertise,
        isCertified,
        filterBy,
        sortBy,
        city,
        isFree,
      }) => {
        return {
          url: `/allProfile?page=${page}&limit=${limit}&expertise=${expertise}&isCertified=${isCertified}&filterBy=${filterBy}&lang=en&sortBy=${sortBy}&isFree=${isFree}`,
        };
      },
      providesTags: ['Astrologer'],
    }),

    getAstroProfile: builder.query({
      query: (id) => `/profile/${id}`,
      providesTags: (result, error, id) => [{ type: 'AstroProfile', id }],
    }),

    seachAstrologers: builder.query({
      query: (searchedText) => `/search/${searchedText}`,
    }),

    updateAstro: builder.mutation({
      query: ({
        experience,
        specialization,
        shortBio,
        shortBio2,
        shortBio3,
        language,
        charges,
        orders,
        reviews,
        rating,
        onboardedBy,
        isNumerologist,
        isPalmist,
        additionalImages,
      }) => {
        return {
          url: `/update`,
          body: {
            experience,
            specialization,
            shortBio,
            shortBio2,
            shortBio3,
            language,
            charges,
            orders,
            reviews,
            rating,
            onboardedBy,
            isNumerologist,
            isPalmist,
            additionalImages,
          },
          method: 'POST',
          credentials: 'include',
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'AstroProfile', id },
      ],
    }),
  }),
});

export const {
  useGetAllAstrologersQuery,
  useGetAstroProfileQuery,
  useUpdateAstroMutation,
  useLazyGetAstroProfileQuery,
  useLazySeachAstrologersQuery,
} = astrologerApi;
