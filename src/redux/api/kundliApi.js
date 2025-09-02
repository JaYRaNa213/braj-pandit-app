import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const kundliApi = createApi({
	reducerPath: 'kundliApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${REACT_APP_BACKEND_URL}`,
	}),
	tagTypes: ['KundliData', 'Location'],
	endpoints: (builder) => ({
		getKundliData: builder.mutation({
			query: ({ url, kundliData }) => {
				return {
					url: `/kundli${url}`,
					method: 'POST',
					body: {
						t: kundliData.t,
						d: kundliData.d,
						name: kundliData.name,
						place: kundliData.place,
					},
				};
			},
			providesTags: (result) => [{ type: 'KundliData', id: result?.id || 'LIST' }],
			invalidatesTags: (result) => [{ type: 'KundliData', id: result?.id || 'LIST' }],
		}),
		getKundliMatchingData: builder.mutation({
			query: (data) => {
				return { url: `/kundli-matching`, method: 'POST', body: data };
			},
			providesTags: (result) => [{ type: 'KundliData', id: result?.id || 'LIST' }],
			invalidatesTags: (result) => [{ type: 'KundliData', id: result?.id || 'LIST' }],
		}),
		getLocation: builder.query({
			query: (city) => `/kundli/place/${city}`,
			providesTags: (result, error, city) => [{ type: 'Location', id: city }],
		}),
	}),
});

export const { useGetKundliDataMutation, useGetKundliMatchingDataMutation, useLazyGetLocationQuery } = kundliApi;
