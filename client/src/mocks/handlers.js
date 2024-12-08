// client/src/mocks/handlers.js

// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from 'msw';
import { db, createIssue, loadInitialData } from './db';

loadInitialData();

export const handlers = [
    rest.post('http://localhost:3000/comments', (req, res, ctx) => {
        const newComment = db.comment.create(req.body);
        return res(ctx.status(201), ctx.json({ comment: newComment }));
    }),
    rest.put('http://localhost:3000/comments/:commentId', (req, res, ctx) => {
        const { commentId } = req.params;
        const updatedComment = db.comment.update({
            where: { id: { equals: Number(commentId) } },
            data: req.body,
        });
        return res(ctx.json({ comment: updatedComment }));
    }),
    rest.delete('http://localhost:3000/comments/:commentId', (req, res, ctx) => {
        const { commentId } = req.params;
        db.comment.delete({ where: { id: { equals: Number(commentId) } } });
        return res(ctx.status(204));
    }),
    rest.get('http://localhost:3000/issues', (req, res, ctx) => {
        const issues = db.issue.getAll();
        return res(ctx.json({ issues }));
    }),
    rest.get('http://localhost:3000/issues/:issueId', (req, res, ctx) => {
        const { issueId } = req.params;
        const issue = db.issue.findFirst({ where: { id: { equals: Number(issueId) } } });
        if (issue) {
            const comments = db.comment.findMany({ where: { issueId: { equals: Number(issueId) } } }).map(comment => ({
                ...comment,
                user: db.currentUser.findFirst({ where: { id: { equals: comment.userId } } })
            }));

            const populatedIssue = {
                ...issue,
                users: issue.userIds.map(userId => db.currentUser.findFirst({ where: { id: { equals: userId } } })),
                comments: comments,
            };
            return res(ctx.json({ issue: populatedIssue }));
        }
        return res(ctx.status(404), ctx.json({ error: 'Issue not found' }));
    }),
    rest.post('http://localhost:3000/issues', (req, res, ctx) => {
        const newIssue = createIssue(req.body);
        return res(ctx.status(201), ctx.json({ issue: newIssue }));
    }),
    rest.put('http://localhost:3000/issues/:issueId', (req, res, ctx) => {
        const { issueId } = req.params;
        const updatedIssue = db.issue.update({
            where: { id: { equals: Number(issueId) } },
            data: req.body,
        });
        return res(ctx.json({ issue: updatedIssue }));
    }),
    rest.delete('http://localhost:3000/issues/:issueId', (req, res, ctx) => {
        const { issueId } = req.params;
        db.issue.delete({ where: { id: { equals: Number(issueId) } } });
        return res(ctx.status(204));
    }),
    rest.get('http://localhost:3000/project', (req, res, ctx) => {
        const project = db.project.getAll()[0];
        return res(ctx.json({ project }));
    }),
    rest.put('http://localhost:3000/project', (req, res, ctx) => {
        const updatedProject = db.project.update({
            where: { id: { equals: req.body.id } },
            data: req.body,
        });
        return res(ctx.json({ project: updatedProject }));
    }),
    rest.get('http://localhost:3000/currentUser', (req, res, ctx) => {
        const currentUser = db.currentUser.getAll()[0];
        return res(ctx.json({ currentUser }));
    }),
];