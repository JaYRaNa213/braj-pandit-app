import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { REACT_APP_BACKEND_URL } from '../../utils/domain';
export const blogApi = createApi({
	reducerPath: 'blogsApi',
	baseQuery: fetchBaseQuery({
		baseUrl: `${REACT_APP_BACKEND_URL}/blog`,
	}),
	tagTypes: ['Blog'],
	endpoints: (builder) => ({
		getAllBlogs: builder.query({
			query: () => `/all`,
			providesTags: (result) => (result ? result.map(({ id }) => ({ type: 'Blog', id })) : []),
		}),
		getBlogByUrl: builder.query({
			query: (url) => `/${url}`,
			providesTags: (result, error, title) => [{ type: 'Blog', id: title }],
		}),
		getBlogsByCategory: builder.query({
			query: (category) => `/category/${category}`,
			providesTags: (result, error, category) => [{ type: 'Blog', id: category }],
		}),
		putBlog: builder.mutation({
			query: ({ content, title, cardDescription }) => {
				return {
					url: `/`,
					body: {
						content,
						title,
						cardDescription,
					},
					method: 'PUT',
				};
			},
			invalidatesTags: (result, error, { title }) => [{ type: 'Blog', id: title }],
		}),
		postBlog: builder.mutation({
			query: ({ content, title, cardDescription }) => {
				return {
					url: `/`,
					body: {
						content,
						title,
						cardDescription,
					},
					method: 'POST',
				};
			},
			invalidatesTags: [{ type: 'Blog', id: 'LIST' }],
		}),
	}),
});

export const { useGetAllBlogsQuery, useGetBlogByUrlQuery, usePutBlogMutation, usePostBlogMutation, useGetBlogsByCategoryQuery, useLazyGetBlogsByCategoryQuery } = blogApi;
