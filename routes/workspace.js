var express = require('express');
var router = express.Router();
const WorkspaceAPIController = require('../controller/api/workspace');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use((req, res, next) => {
    //TODO: bearer auth
    //TODO: role check
    next();
});

router.get('/', (req, res) => { res.status(403).json({ message: "Forbidden" }) })
    .post('/', WorkspaceAPIController.addWorkspace)
    .get('/:name', WorkspaceAPIController.getWorkspace)
    .put('/:name', WorkspaceAPIController.updateWorkspace)
    .get('/:name/feeds', WorkspaceAPIController.getFeeds)
    .get('/:name/users', WorkspaceAPIController.getUsers)
    .post('/:name/users', WorkspaceAPIController.addUser)
    .post('/:name/filetree', WorkspaceAPIController.addFiletree)
    .put('/:name/documents', WorkspaceAPIController.updateDocument)
    .put('/:name/filetree', WorkspaceAPIController.addFiletree)
    .delete('/:name/user', WorkspaceAPIController.deleteUser)
    .post('/:name/join', WorkspaceAPIController.joinWorkspace)

//document manage endpoint
router.get('/:name/documents', WorkspaceAPIController.getDocuments)
    .post('/:name/documents', upload.single('file'), WorkspaceAPIController.addDocument)
    .post('/:name/documents/submit', upload.single('file'), WorkspaceAPIController.askAddDocument)
    .get('/:name/documents/:docid', WorkspaceAPIController.getDocument)
    .get('/:name/documents/:docid/file', WorkspaceAPIController.getDocumentFile)
    .get('/:name/documents/:docid/versions', WorkspaceAPIController.getDocumentVersions)
    .get('/:name/documents/:docid/file/versions/:version', WorkspaceAPIController.getDocumentVersion)
    .post('/:name/documents/:docid/versions', upload.single('file'), WorkspaceAPIController.addDocumentVersion)
    .post('/:name/documents/:docid/versions/submit', upload.single('file'), WorkspaceAPIController.askAddDocumentVersion)
    .post('/:name/documents/:docid/comments', WorkspaceAPIController.addComment)
    .get('/:name/documents/:docid/comments', WorkspaceAPIController.getComments)

router.get('/:name/feeds', WorkspaceAPIController.getFeeds)

router.get('/test/:id', (req, res, next) => {
    res.send('woosh')
})

module.exports = router;
