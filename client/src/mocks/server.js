// client/src/mocks/server.js

// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Setup a worker for the test environment (Node)
export const server = setupServer(...handlers);