// store.ts
import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer, { RootState } from "./reducers";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["userDetails"],
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
