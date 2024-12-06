// client/src/mocks/browser.js

// eslint-disable-next-line import/no-extraneous-dependencies
import { setupWorker } from "msw";
import { handlers } from "./handlers";

// Setup a worker for the dev environment (browser)
export const worker = setupWorker(...handlers);

worker.printHandlers();