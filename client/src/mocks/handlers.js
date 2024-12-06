// client/src/mocks/handlers.js

// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from 'msw';
import { db, createIssue, loadInitialData } from './db';

loadInitialData();

export const handlers = [
    rest.get('http://localhost:3000/project', (req, res, ctx) => {
        const project = db.project.getAll()[0];
        return res(ctx.json({ project }));
    }),
    rest.get('http://localhost:3000/currentUser', (req, res, ctx) => {
        const currentUser = db.currentUser.getAll()[0];
        return res(ctx.json({ currentUser }));
    }),
    rest.post('http://localhost:3000/issues', (req, res, ctx) => {
        const newIssue = createIssue(req.body);
        return res(ctx.status(201), ctx.json({ issue: newIssue }));
    }),
];