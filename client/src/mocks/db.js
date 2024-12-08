// client/src/mocks/db.js

// eslint-disable-next-line import/no-extraneous-dependencies
import { factory, primaryKey } from "@mswjs/data";
// eslint-disable-next-line import/no-extraneous-dependencies
import { datatype } from "faker";
import projectData from './data/project.json';

export const db = factory({
    issue: {
        id: primaryKey(datatype.number),
        title: String,
        type: String,
        status: String,
        priority: String,
        listPosition: Number,
        description: String,
        reporterId: Number,
        projectId: Number,
        users: Array,
        descriptionText: String,
        estimate: Number,
        timeSpent: Number,
        timeRemaining: Number,
        createdAt: String,
        updatedAt: String,
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
    const project = db.project.getAll()[0];
    localStorage.setItem('project', JSON.stringify(project));
};

const loadFromLocalStorage = () => {
    const project = JSON.parse(localStorage.getItem('project'));
    if (project) {
        createProjectFromData(project);
    }
};


const createProjectFromData = (project) => {
    const createdProject = db.project.create({
        id: project.id,
        name: project.name,
        url: project.url,
        description: project.description,
        category: project.category,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        users: [],
        issues: [],
    });

    project.users.forEach(user => {
        const createdUser = db.currentUser.create(user);
        createdProject.users.push(createdUser);
    });

    project.issues.forEach(issue => {
        const createdIssue = db.issue.create(issue);
        createdProject.issues.push(createdIssue);
    });

    db.project.update({
        where: { id: { equals: createdProject.id } },
        data: {
            users: createdProject.users,
            issues: createdProject.issues,
        },
    });
};

export const loadInitialData = () => {
    loadFromLocalStorage();

    if (!db.project.count()) {
        createProjectFromData(projectData.project);
        saveToLocalStorage();
    }

    if (!db.currentUser.count()) {
        db.currentUser.create(projectData.currentUser);
    }

    if (!db.comment.count()) {
        projectData.project.comments.forEach(comment => {
            db.comment.create(comment);
        });
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

    const project = db.project.findFirst({ where: { id: { equals: projectId } } });
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