import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from './reducer/userReducer';
import { astrologerApi } from './api/astrologerApi';
import { setupListeners } from '@reduxjs/toolkit/query';
import { blogApi } from './api/blogApi';
import { userApi } from './api/userApi';
import { horoscopeApi } from './api/horoscopeApi';
import { templeApi } from './api/templeApi';
import { compatibilityApi } from './api/compatibilityApi';
import { kundliApi } from './api/kundliApi';
import { contentApi } from './api/contentApi';
import { orderApi } from './api/orderApi';
import { chatApi } from './api/chatApi';
import { notificationApi } from './api/notificationApi';

export const store = configureStore({
  reducer: {
    [astrologerApi.reducerPath]: astrologerApi.reducer,
    [horoscopeApi.reducerPath]: horoscopeApi.reducer,
    [templeApi.reducerPath]: templeApi.reducer,
    [blogApi.reducerPath]: blogApi.reducer,
    [compatibilityApi.reducerPath]: compatibilityApi.reducer,
    [kundliApi.reducerPath]: kundliApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [contentApi.reducerPath]: contentApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [userReducer.name]: userReducer.reducer,
    [notificationApi.name]: notificationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      astrologerApi.middleware,
      horoscopeApi.middleware,
      templeApi.middleware,
      blogApi.middleware,
      compatibilityApi.middleware,
      kundliApi.middleware,
      userApi.middleware,
      contentApi.middleware,
      orderApi.middleware,
      chatApi.middleware,
      notificationApi.middleware
    ),
});

setupListeners(store.dispatch);
