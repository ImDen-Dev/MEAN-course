const express = require('express');
const router = express.Router();
const extractFile = require('../middleware/file');

const postsController = require('../controllers/posts');
const checkAuth = require('../middleware/check-auth');

router.get('', postsController.getPosts);

router.get('/:id', postsController.getPost);

router.post('', checkAuth, extractFile, postsController.createPost);

router.put('/:id', checkAuth, extractFile, postsController.updatePost);

router.delete('/:id', checkAuth, postsController.deletePost);

module.exports = router;
