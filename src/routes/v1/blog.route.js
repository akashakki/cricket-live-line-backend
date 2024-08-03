const express = require('express');
const { adminAuth, basicAuth } = require('../../middlewares');
const validate = require('../../middlewares/validate');
const { blogValidation } = require('../../validations');
const { BlogController } = require('../../controllers');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, global.filePath + 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const router = express.Router();

router
  .route('/')
  .post(adminAuth('createBlog'), upload.any(), BlogController.createBlog)
  .get(adminAuth('getBlogs'), validate(blogValidation.getBlogs), BlogController.getBlogs);

router
  .route('/:blogId')
  .get(adminAuth('getBlog'), validate(blogValidation.getBlog), BlogController.getBlog)
  .patch(adminAuth('updateBlog'), upload.any(), BlogController.updateBlog)
  .delete(adminAuth('deleteBlog'), validate(blogValidation.deleteBlog), BlogController.deleteBlog);

// router
//   .route('/slug/:slug')
//   .get(adminAuth('getBlogDetailsUsingSlug'), BlogController.getBlogDetailsUsingSlug)

router
  .route('/list/dropdown')
  .get(adminAuth('getBlogsWithoutPagination'), BlogController.getBlogsWithoutPagination);

router
  .route('/for/user')
  .get(validate(blogValidation.getBlogs), BlogController.getBlogsForUser);

router
  .route('/for/user/:slug')
  .get(validate(blogValidation.getBlogs), BlogController.getBlogDetailsForUser)
  .put(BlogController.incrementBlogView);


module.exports = router;