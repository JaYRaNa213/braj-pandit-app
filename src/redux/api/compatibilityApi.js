import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const compatibilityApi = createApi({
	reducerPath: 'compatibilityApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${REACT_APP_BACKEND_URL}/compatibility`,
	}),
	tagTypes: ['Compatibility'],
	endpoints: (builder) => ({
		getZodaicCompatibility: builder.query({
			query: (zodiac) => `/all/${zodiac}`,
			providesTags: (result, error, zodiac) => [{ type: 'Compatibility', id: zodiac }],
		}),
		getBothZodaicCompatibility: builder.query({
			query: ({ zodiac1, zodiac2, gender1, gender2 }) => `?z1=${zodiac1}&g1=${gender1}&z2=${zodiac2}&g2=${gender2}`,
			providesTags: (result, error, { zodiac1, zodiac2 }) => [{ type: 'Compatibility', id: `${zodiac1}-${zodiac2}` }],
		}),
	}),
});

export const { useGetZodaicCompatibilityQuery, useGetBothZodaicCompatibilityQuery } = compatibilityApi;
