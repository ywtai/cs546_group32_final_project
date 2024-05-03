// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import { Router } from 'express';
import { reviewData, commentData } from "../data/index.js";
import { logRequests, redirectBasedOnRole, ensureLoggedIn, ensureAdmin } from '../middleware.js'
import validation from '../validation.js';
import multer from 'multer';
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const newFilename = uniqueSuffix + extension;
    callback(null, newFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

const maxFiles = 5;
const uploadPhotos = upload.array('photos', maxFiles);

const router = Router();

router.use(logRequests);

router
  .route('/addReview/:parkObjectId')
  .get(ensureLoggedIn, async (req, res) => {
    let parkId = req.params.parkObjectId;

    try {
      parkId = validation.checkId(parkId, 'id parameter in URL');
      res.render('addReview', {
        documentTitle: 'Add Review',
        parkId: parkId
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
      if (!res.headersSent) {
        res.status(500).send("Error processing your request.");
      }
    }
  })
  .post(uploadPhotos, ensureLoggedIn, async (req, res) => {
    let parkId = req.params.parkObjectId;
    let reviewInfo = req.body;

    let photoPaths = [];
    if (req.files) {
      photoPaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    if (!reviewInfo || Object.keys(reviewInfo).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }

    let { title, content, rating } = reviewInfo;

    try {
      req.params.parkObjectId = validation.checkId(req.params.parkObjectId);
      title = validation.checkString(title, 'Title');
      content = validation.checkString(content, 'Content');
      rating = validation.checkRating(rating, 'Rating');
    } catch (e) {
      return res.status(400).render('addReview', {
        documentTitle: 'Add Review',
        parkId: parkId,
        hasErrors: true,
        errors: e.toString()
      });
    }
    try {
      const { reviewSubmittedCompleted } = await reviewData.createReview(
        req.params.parkObjectId,
        req.session.user.userId,
        title,
        req.session.user.userName,
        content,
        photoPaths,
        rating
      );
      res.json({
        success: true,
        message: 'Review added successfully',
        redirectUrl: `/park/${parkId}`
      })
    } catch (e) {
      return res.status(400).render('addReview', {
        documentTitle: 'Add Review',
        parkId: parkId,
        hasErrors: true,
        errors: e.toString()
      });
    }
  });

router
  .route('/review/:reviewId')
  .get(async (req, res) => {
    try {
      const reviewId = validation.checkId(req.params.reviewId);
      const review = await reviewData.getReview(reviewId);
      const comments = await commentData.getAllComments(reviewId);
      const userId = req.session.user ? req.session.user.userId : null;

      const commentsWithAuthCheck = comments.map(comment => ({
        ...comment,
        commentIsAuthor: comment.userId === userId
      }));
      
      res.render('review', {
        title: review.title,
        userName: review.userName,
        content: review.content,
        comment: commentsWithAuthCheck,
        reviewDate: review.reviewDate,
        rating: review.rating,
        photos: review.photos,
        reviewId: req.params.reviewId,
        isAuthor: review.userId === userId,
        isLogin: !!req.session.user,
        parkId: req.params.parkId,
        commentIndex: 0
      })     
    } catch (e) {
      res.redirect('/');
    }
  })
  .post(ensureLoggedIn, async (req, res) => {
    let updateObject = req.body;
    if (!updateObject || Object.keys(updateObject).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }

    const userId = req.session.user.userId;
    let { title, content, rating } = updateObject;

    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);

      if (title)
        title = validation.checkString(title, 'Title');

      if (content)
        content = validation.checkString(content, 'Content');

      if (rating)
        rating = validation.checkRating(rating, 'Rating');
    } catch (e) {
      return res.status(400).json({ error: e });
    }

    try {
      const review = await reviewData.getReview(req.params.reviewId);
      if (review.userId !== userId) {
          return res.status(403).json({ error: "You do not have permission to modify this review." });
      }

      const updatedReview = await reviewData.updateReview(
        req.params.reviewId,
        updateObject
      );
    } catch (e) {
      return res.status(404).send({ error: e });
    }

    try {
      const review = await reviewData.getReview(req.params.reviewId);
      const isAuthor = req.session.user && (req.session.user.userId === review.userId);
      if (isAuthor) {
        res.json({
          success: true,
          message: 'Review edited successfully',
          redirectUrl: `/review/${req.params.reviewId}`
        })
      }
      else {
        res.json({
          success: false,
          message: 'Review edited failed',
          redirectUrl: `/review/${req.params.reviewId}`
        })
      }
    } catch (e) {
      res.json({
        success: false,
        message: 'Review edited failed',
        redirectUrl: `/review/${req.params.reviewId}`
      })
    }
  })
  .delete(ensureLoggedIn, upload.none(), async (req, res) => {
    const userId = req.session.user.userId;
    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    
    try {
      const review = await reviewData.getReview(req.params.reviewId);
      if (review.userId !== userId) {
          return res.status(403).json({ error: "You do not have permission to delete this review." });
      }
      let deletedReview = await reviewData.removeReview(req.params.reviewId);
      const parkId = deletedReview._id.toString();
      res.json({redirectUrl: '/park/' + parkId});
    } catch (e) {
      return res.status(404).send({ error: e });
    }
  });

router
  .route('/review/:reviewId/addcomment')
  .get(ensureLoggedIn, async (req, res) => {
    let reviewId = req.params.reviewId;

    try {
      reviewId = validation.checkId(reviewId, 'id parameter in URL');
      res.render('addComment', {
        documentTitle: 'Add Comment',
        reviewId: reviewId
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
      if (!res.headersSent) {
        res.status(500).send("Error processing your request.");
      }
    }
  })
  .post(ensureLoggedIn, async (req, res) => {
    let { content } = req.body;

    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);
      content = validation.checkString(content, 'Content');
    } catch (e) {
      return res.status(400).json({ error: e });
    }

    try {
      const newComment = await commentData.createComment(
        req.params.reviewId,
        req.session.user.userId,
        req.session.user.userName,
        content
      );
      res.json({
        success: true,
        message: 'Comment added successfully'
      })
    } catch (e) {
      res.json({
        success: false,
        message: 'Comment added fail'
      })
    }
  });

router
  .route('/review/:reviewId/comment/:commentId')
  .get(async (req, res) => {
    let commentId = validation.checkId(req.params.commentId);

    try {
      const comment = await commentData.getComment(commentId);
      return res.json(comment);
    } catch (e) {
      return res.status(404).json({ error: 'Comment not found or could not be retrieved' });
    }
  })
  .post(ensureLoggedIn, upload.none(), async (req, res) => {
    const userId = req.session.user.userId;
    let updateObject = req.body;
    if (!updateObject || Object.keys(updateObject).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'There are no fields in the request body'  
      });
    }

    let { content } = updateObject;

    try {
      if (content)
        content = validation.checkString(content, 'Content');
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: "Content must be a non-empty string."  
      });
    }

    try {
      req.params.commentId = validation.checkId(req.params.commentId);
      req.params.reviewId = validation.checkId(req.params.reviewId);      
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fail to load comment.'  
      });
    }

    try {
      const comment = await commentData.getComment(req.params.commentId);
      const isAuthor = req.session.user && (userId === comment.userId);
      if (!isAuthor) {
        return res.status(403).json({ 
          success: false, 
          message: "You do not have permission to edit this comment." 
        });
      }
    } catch (e) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have permission to edit this comment." 
      });
    }

    try{
      const updatedComment = await commentData.updateComment(
        req.params.commentId,
        updateObject
      );
      res.json({
        success: true, 
        message: 'Success to update comment.',
        redirectUrl: `/review/${req.params.reviewId}`,
        commentIsAuthor: true
      })
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        message: 'Fail to update comment.'  
      });
    }
  })
  .delete(ensureLoggedIn, upload.none(), async (req, res) => {
    const userId = req.session.user.userId;
    try {
      req.params.commentId = validation.checkId(req.params.commentId);
      req.params.reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    
    try {
      const comment = await commentData.getComment(req.params.commentId);
      if (comment.userId !== userId) {
          return res.status(403).json({ error: "You do not have permission to delete this comment." });
      }
      let deletedComment = await commentData.removeComment(req.params.commentId);
      res.json({redirectUrl: '/review/' + req.params.reviewId});
    } catch (e) {
      return res.status(404).send({ error: e });
    }
  })


export default router;