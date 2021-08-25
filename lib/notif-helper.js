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
    'jw': async ({ data }) => {
        try {
            let workspace = await require("../models/workspace-model").findOne({ name: data.workspace }).select("-__v").exec();
            let user = await require("../models/user-model").findOne({ username: data.joiningUser }).exec();

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
    'aw': async ({ data }) => {
        try {
            let document = await Document.findById(data.document.documentId).exec();
            await document.addVersion({ fsId: data.document.fsId });

            return { status: 1, message: 'succes' }
        } catch (error) {
            console.log(error);
            return { status: 0, message: error.message }
        }
    },
    'ad': async() => {}
}

module.exports = { ACTION, actionHelper }