import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';

export const templeApi = createApi({
  reducerPath: 'templeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${REACT_APP_BACKEND_URL}/temple`,
  }),
  tagTypes: ['Temple'],
  endpoints: (builder) => ({
    getAllTemples: builder.query({
      query: (state) => `/allTemple?state=${state}`,
      providesTags: (result, state) => [{ type: 'Temple', id: 'LIST' }],
    }),
    getAllStates: builder.query({
      query: () => '/allStates',
      providesTags: (result) => [{ type: 'Temple', id: 'LIST' }],
    }),
    getTempleByTitle: builder.query({
      query: (title, lang) => `/?title=${title}&lang=${lang}`,
      providesTags: (result, error, title) => [{ type: 'Temple', id: title }],
    }),
  }),
});

export const {
  useGetAllTemplesQuery,
  useGetTempleByTitleQuery,
  useGetAllStatesQuery,
} = templeApi;
