var express = require('express');
var router = express.Router();
const WorkspaceAPIController = require('../controller/api/workspace');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.use((req,res,next) => {
    //auth here
    next();
});
router.get('/', (req,res) => {res.status(403).json({message: "Forbidden"})})
router.post('/', WorkspaceAPIController.addWorkspace);
router.get('/:name', WorkspaceAPIController.getWorkspace);
router.get('/:name/users', WorkspaceAPIController.getUsers);
router.get('/:name/documents', WorkspaceAPIController.getDocuments);
router.get('/:name/documents/:docid', WorkspaceAPIController.getDocument);
router.get('/:name/documents/:docid/file', WorkspaceAPIController.getDocumentFile);
router.post('/:name/documents', upload.single('file'), WorkspaceAPIController.addDocument);
router.post('/:name/filetree', WorkspaceAPIController.addFiletree);
router.post('/:name/users', WorkspaceAPIController.putUser);
router.put('/:name/documents', WorkspaceAPIController.updateDocument);
router.put('/:name', WorkspaceAPIController.updateWorkspace);
router.put('/:name/filetree', WorkspaceAPIController.addFiletree);
router.delete('/:name/user', WorkspaceAPIController.deleteUser);

module.exports = router;
