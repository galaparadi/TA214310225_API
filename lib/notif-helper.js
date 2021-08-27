const Workspace = require("../models/workspace-model");
const User = require("../models/user-model");
const Document = require('../models/document-model');

const ACTION = { 'JOIN_WORKSPACE': 'jw', 'ADD_NEW_VERSION': 'aw', 'ADD_DOCUMENT': 'ad', };

const pushHelper = {
    'jw': async () => {
        try {

        } catch (error) {

        }
    },
}

const actionHelper = {
    'jw': async ({ workspace: name, joiningUser }) => {
        try {
            let workspace = await require("../models/workspace-model").findOne({ name }).select("-__v").exec();
            let user = await require("../models/user-model").findOne({ username: joiningUser }).exec();

            if (!workspace)
                return { status: 0, message: "workspace not found" };

            await workspace.addUser({ user: user.id, level: 1, disable: false });
            await user.addWorkspaces(workspace.id);
            return { status: 1, message: 'succes' }
        } catch (error) {
            console.log(error);
            return { status: 0, message: error.message }
        }
    },
    'aw': async ({ document: documentParam }) => {
        try {
            let document = await Document.findById(documentParam.documentId).exec();
            await document.addVersion({ fsId: document.fsId });

            return { status: 1, message: 'succes' }
        } catch (error) {
            console.log(error);
            return { status: 0, message: error.message }
        }
    },
    'ad': async ({ document, workspace: name }) => {
        try {
            let subDocument = new Document({ name: document.filename, author: document.author, version: document.version });
            let workspace = await Workspace.findOne({ name }).exec();
            workspace.pushDocument({ name: document.name, author: document.author, documentId: subDocument.id });
            workspace.save();
            subDocument.save();
            return { status: 1, message: 'sukses' }
        } catch (error) {
            console.log(error);
            return { status: 0, error, message: error.message }
        }
    }
}

module.exports = { ACTION, actionHelper }