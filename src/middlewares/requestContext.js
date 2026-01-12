//src/middlewares/requestContext.js
import { AsyncLocalStorage } from "async_hooks";

export const requestContext = new AsyncLocalStorage();
