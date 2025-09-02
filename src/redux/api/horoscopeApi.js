import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const horoscopeApi = createApi({
	reducerPath: 'horoscopeApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${REACT_APP_BACKEND_URL}/horoscope`,
	}),
	tagTypes: ['Horoscope', 'HoroscopeParagraph', 'Content', 'Image', 'ZodiacContent', 'ZodiacImage', 'ZodiacImages'],
	endpoints: (builder) => ({
		getTodaysHoroscope: builder.query({
			query: ({ type }) => {
				return { url: `/`, params: { type: type } };
			},
			providesTags: (result, error, { type }) => [{ type: 'Horoscope', id: type }],
		}),
		getHoroscopeParagraph: builder.query({
			query: ({ type }) => {
				return { url: `/type/${type ?? ''}` };
			},
			providesTags: (result, error, { type }) => [{ type: 'HoroscopeParagraph', id: type }],
		}),
		getImage: builder.query({
			query: (zodiac) => `/zodiacImage?zodiac=${zodiac}`,
			providesTags: (result, error, zodiac) => [{ type: 'Image', id: zodiac }],
		}),

		getZodiacImage: builder.query({
			query: (zodiac) => `/zodiacImage?zodiac=${zodiac}`,
			providesTags: (result, error, zodiac) => [{ type: 'ZodiacImage', id: zodiac }],
		}),
		postHoroscope: builder.mutation({
			query: (data) => {
				return {
					url: `/update`,
					body: data,
					method: 'POST',
				};
			},
		}),
	}),
});

export const { useGetTodaysHoroscopeQuery, useGetHoroscopeParagraphQuery, useGetImageQuery, useGetZodiacImageQuery, usePostHoroscopeMutation } = horoscopeApi;
