var express = require('express');
var router = express.Router();
const WorkspaceAPIController = require('../controller/api/workspace');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use((req, res, next) => {
    //TODO: bearer auth
    next();
});
router.get('/', (req, res) => { res.status(403).json({ message: "Forbidden" }) })
    .post('/', WorkspaceAPIController.addWorkspace)
    .get('/:name', WorkspaceAPIController.getWorkspace)
    .put('/:name', WorkspaceAPIController.updateWorkspace)
    .post('/:name/join', WorkspaceAPIController.joinWorkspace)
    .get('/:name/feeds', WorkspaceAPIController.getFeeds)
    .get('/:name/users', WorkspaceAPIController.getUsers)
    .post('/:name/users', WorkspaceAPIController.addUser)
    .get('/:name/documents', WorkspaceAPIController.getDocuments)
    .post('/:name/documents', upload.single('file'), WorkspaceAPIController.addDocument)
    .get('/:name/documents/:docid', WorkspaceAPIController.getDocument)
    .get('/:name/documents/:docid/file', WorkspaceAPIController.getDocumentFile)
    .get('/:name/documents/:docid/versions', WorkspaceAPIController.getDocumentVersions)
    .get('/:name/documents/:docid/versions/:version', WorkspaceAPIController.getDocumentVersion)
    .post('/:name/documents/:docid/versions', upload.single('file'), WorkspaceAPIController.addDocumentVersion)
    .post('/:name/documents/:docid/versions/submit', upload.single('file'), WorkspaceAPIController.askAddDocumentVersion)
    .post('/:name/documents/:docid/comments', WorkspaceAPIController.addComment)
    .get('/:name/documents/:docid/comments', WorkspaceAPIController.getComments)
    .post('/:name/filetree', WorkspaceAPIController.addFiletree)
    .put('/:name/documents', WorkspaceAPIController.updateDocument)
    .put('/:name/filetree', WorkspaceAPIController.addFiletree)
    .delete('/:name/user', WorkspaceAPIController.deleteUser)

module.exports = router;
