var express = require('express');
var router = express.Router();
const WorkspaceAPIController = require('../controller/api/workspace');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use((req, res, next) => {
    //auth here
    next();
});
router.get('/', (req, res) => { res.status(403).json({ message: "Forbidden" }) })
    .post('/', WorkspaceAPIController.addWorkspace)
    .get('/:name', WorkspaceAPIController.getWorkspace)
    .get('/:name/users', WorkspaceAPIController.getUsers)
    .get('/:name/documents', WorkspaceAPIController.getDocuments)
    .get('/:name/documents/:docid', WorkspaceAPIController.getDocument)
    .get('/:name/documents/:docid/file', WorkspaceAPIController.getDocumentFile)
    .post('/:name/documents', upload.single('file'), WorkspaceAPIController.addDocument)
    .post('/:name/filetree', WorkspaceAPIController.addFiletree)
    .post('/:name/users', WorkspaceAPIController.putUser)
    .put('/:name/documents', WorkspaceAPIController.updateDocument)
    .put('/:name', WorkspaceAPIController.updateWorkspace)
    .put('/:name/filetree', WorkspaceAPIController.addFiletree)
    .delete('/:name/user', WorkspaceAPIController.deleteUser)

module.exports = router;
