import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${REACT_APP_BACKEND_URL}/horscope`,
  }),
  tagTypes: ['ZodiacContent', 'Content', 'ZodiacImages', 'Image'],
  endpoints: (builder) => ({
    getContent: builder.query({
      query: (zodiac) => `/?type=horoscope-today&zodiac=${zodiac}`,
      providesTags: (result, error, zodiac) => [
        { type: 'Content', id: zodiac },
      ],
    }),
    getZodiacContent: builder.query({
      query: ({ type, zodiac }) => `?type=${type}&zodiac=${zodiac}`,
      providesTags: (result, error, { type, zodiac }) => [
        { type: 'ZodiacContent', id: `${type}-${zodiac}` },
      ],
    }),
    getZodiacImages: builder.query({
      query: (zodiac) => `/zodiacImages`,
      providesTags: (result, error, zodiac) => [
        { type: 'ZodiacImages', id: zodiac },
      ],
    }),
    getImage: builder.query({
      query: (zodiac) => `/zodiacImage?zodiac=${zodiac}`,
      providesTags: (result, error, zodiac) => [{ type: 'Image', id: zodiac }],
    }),
  }),
});

export const {
  useGetContentQuery,
  useGetZodiacContentQuery,
  useLazyGetZodiacContentQuery,
  useGetImageQuery,
  useGetZodiacImagesQuery,
} = contentApi;
