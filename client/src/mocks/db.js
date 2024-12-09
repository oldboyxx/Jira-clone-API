// client/src/mocks/db.js

// eslint-disable-next-line import/no-extraneous-dependencies
import { factory, primaryKey } from "@mswjs/data";
// eslint-disable-next-line import/no-extraneous-dependencies
import { datatype } from "faker";
import guestAccountData from './data/guest-account.json';

export const db = factory({
    user: {
        id: primaryKey(datatype.number),
        email: String,
        name: String,
        avatarUrl: String,
    },
    issue: {
        id: primaryKey(datatype.number),
        title: String,
        type: String,
        status: String,
        priority: String,
        listPosition: Number,
        description: String,
        descriptionText: String,
        estimate: Number,
        timeSpent: Number,
        timeRemaining: Number,
        createdAt: String,
        updatedAt: String,
        reporterId: Number,
        projectId: Number,
        users: Array,
        comments: Array,
        userIds: Array,
    },
    project: {
        id: primaryKey(datatype.number),
        name: String,
        url: String,
        description: String,
        category: String,
        createdAt: String,
        updatedAt: String,
        users: Array,
        issues: Array,
    },
    currentUser: {
        id: primaryKey(datatype.number),
        name: String,
        email: String,
        avatarUrl: String,
        createdAt: String,
        updatedAt: String,
        projectId: Number,
    },
    comment: {
        id: primaryKey(datatype.number),
        body: String,
        createdAt: String,
        updatedAt: String,
        userId: Number,
        issueId: Number,
    },
});

const saveToLocalStorage = () => {
    const data = {
        project: db.project.getAll()[0],
        users: db.user.getAll(),
        issues: db.project.getAll()[0].issues, // Hack: for some reason issues.getAll() strips arrays
        comments: db.comment.getAll(),
        currentUser: db.currentUser.getAll(),
    };
    localStorage.setItem('db', JSON.stringify(data));
};

const loadFromLocalStorage = () => {
    const data = JSON.parse(localStorage.getItem('db'));
    if (data) {
        createGuestAccountFromData(data);
    }
};

const createGuestAccountFromData = (data) => {
    if (data.project) {
        if (!db.project.findFirst({ where: { id: { equals: data.project.id } } })) {
            db.project.create(data.project);
        }
    }

    if (data.users) {
        data.users.forEach(user => {
            if (!db.user.findFirst({ where: { id: { equals: user.id } } })) {
                const newUser = db.user.create(user);
                const project = db.project.getAll()[0]; // Assuming there is at least one project
                if (project) {
                    project.users.push(newUser);
                    db.project.update({
                        where: { id: { equals: project.id } },
                        data: { users: project.users },
                    });
                }
            }
        });
    }

    if (data.issues) {
        data.issues.forEach(issue => {
            if (!db.issue.findFirst({ where: { id: { equals: issue.id } } })) {
                const createdIssue = db.issue.create(issue);
                issue.userIds.forEach(userId => {
                    const user = db.user.findFirst({ where: { id: { equals: userId } } });
                    if (user) {
                        createdIssue.users.push(user);
                        createdIssue.userIds.push(userId);
                    }
                });
                const project = db.project.getAll()[0]; // Assuming there is at least one project
                if (project) {
                    project.issues.push(createdIssue);
                    db.project.update({
                        where: { id: { equals: project.id } },
                        data: { issues: project.issues },
                    });
                }
            }
        });
    }

    if (data.comments) {
        data.comments.forEach(comment => {
            if (!db.comment.findFirst({ where: { id: { equals: comment.id } } })) {
                db.comment.create(comment);
            }
        });
    }

    if (data.currentUser) {
        const currentUser = data.users.find(user => user.id === data.currentUser);
        if (currentUser && !db.currentUser.findFirst({ where: { id: { equals: currentUser.id } } })) {
            db.currentUser.create(currentUser);
        }
    }
};

export const loadInitialData = () => {
    loadFromLocalStorage();

    if (!db.project.count()) {
        createGuestAccountFromData(guestAccountData);
        saveToLocalStorage();
    }
};

export const createIssue = ({ type, title, description, reporterId, userIds, priority, status, projectId, users }) => {
    const newIssue = db.issue.create({
        id: datatype.number(),
        type,
        title,
        description,
        reporterId,
        userIds: userIds || [],
        priority,
        status,
        projectId,
        users: [],
        descriptionText: description.replace(/<[^>]+>/g, ''),
        listPosition: -1,
        estimate: null,
        timeSpent: null,
        timeRemaining: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const project = db.project.getAll()[0];
    if (project) {
        users.forEach(user => {
            const existingUser = project.users.find(projUser => projUser.id === user.id);
            if (existingUser) {
                newIssue.users.push({ id: existingUser.id });
                newIssue.userIds.push(existingUser.id);
            }
        });

        project.issues.push(newIssue);
        db.project.update({
            where: { id: { equals: projectId } },
            data: { issues: project.issues },
        });
    }

    saveToLocalStorage();

    return newIssue;
};

export const exportDatabase = () => {
    const data = {
        issues: db.issue.getAll(),
        projects: db.project.getAll(),
        currentUser: db.currentUser.getAll(),
        comments: db.comment.getAll(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.json';
    a.click();
    URL.revokeObjectURL(url);
};

export const importDatabase = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        db.issue.clear();
        db.project.clear();
        db.currentUser.clear();
        db.comment.clear();
        data.issues.forEach(issue => db.issue.create(issue));
        data.projects.forEach(project => db.project.create(project));
        data.currentUser.forEach(user => db.currentUser.create(user));
        data.comments.forEach(comment => db.comment.create(comment));
        saveToLocalStorage();
    };
    reader.readAsText(file);
};