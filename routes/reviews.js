// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import { Router } from 'express';
import { parksData, reviewData, commentData } from "../data/index.js";
import { logRequests, redirectBasedOnRole, ensureLoggedIn, ensureAdmin } from '../middleware.js'
import validation from '../validation.js';
import multer from 'multer';
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from 'fs';
import { addToReviews, deleteReviews, addToComments, deleteComments, getUserById, addToLiked, deleteLiked} from '../data/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    callback(null, uploadDir);
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    let lowercasedMimetype = file.mimetype.toLowerCase();
    if (lowercasedMimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/png') {
      return cb(new Error('Invalid file type. Please upload a JPG, JPEG, PNG'), false);
    }
    cb(null, true);
  }
});

const checkMinPhotoSize = (req, res, next) => {
  const minFileSize = 1024;

  if (req.files) {
    for (let file of req.files) {
      if (file.size < minFileSize) {
        return res.status(400).res.render('addReview', {
          hasErrors: true,
          errors: "Photo too small, please select photos more than 1KB."
        });
      }
    }
  }
  next();
};

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
      const parkDetail = await parksData.getParkById(parkId);
      if (parkDetail) {
        res.render('addReview', {
          documentTitle: 'Add Review',
          parkId: parkId
        });
      } else {
        res.status(404).render('error', { message: 'Page not Found' });
      }
    } catch (e) {
      res.status(404).render('error', { message: 'Page not Found' });
    }
  })
  .post(uploadPhotos, checkMinPhotoSize, ensureLoggedIn, async (req, res) => {
    let parkId = req.params.parkObjectId;
    let reviewInfo = req.body;

    let photoPaths = [];
    if (req.files) {
      photoPaths = req.files.map(file => `/uploads/${file.filename}`);
    }

    if (!reviewInfo || Object.keys(reviewInfo).length === 0) {
      return res.status(400).render('error', {
        message: 'There are no fields in the request body'
      });
    }

    let { title, content, rating } = reviewInfo;

    try {
      req.params.parkObjectId = validation.checkId(req.params.parkObjectId);
      title = validation.checkString(title, 'Title', { min: '2', max: '20' });
      content = validation.checkString(content, 'Content', { min: '2', max: '200' });
      rating = validation.checkRating(rating, 'Rating');
    } catch (e) {
      return res.status(400).render('error', {
        message: e.toString()
      });
    }
    try {
      const { reviewSubmittedCompleted, reviewId} = await reviewData.createReview(
        req.params.parkObjectId,
        req.session.user.userId,
        title,
        req.session.user.userName,
        content,
        photoPaths,
        rating
      );

      const pushInfo =  {
        reviewId: reviewId,
        parkId: req.params.parkObjectId
      }
      const addInfo = await addToReviews(req.session.user.userId, pushInfo);
      if (reviewSubmittedCompleted)
        res.redirect(`/park/${parkId}`);
      else 
        res.status(500).render('error', { message: 'Internal Server Error' });
    } catch (e) {
      return res.status(400).render('addReview', {
        parkId: parkId,
        hasErrors: true,
        errors: e.toString()
      });
    }
  });

router
  .route('/review/:reviewId')
  .get(async (req, res) => {
    let reviewId = req.params.reviewId
    try {
      reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      res.status(404).render('error', { message: 'Page not Found' });
    }

    try {
      const {parkId, review} = await reviewData.getReview(reviewId);
      const comments = await commentData.getAllComments(reviewId);
      const userId = req.session.user ? req.session.user.userId : null;

      const commentsWithAuthCheck = comments.map(comment => ({
        ...comment,
        commentIsAuthor: comment.userId === userId
      }));

      let photos = validation.checkPhotoExist(review.photos);

      if (!req.session.user) {
        res.render('review', {
          title: review.title,
          userName: review.userName,
          content: review.content,
          comment: commentsWithAuthCheck,
          reviewDate: review.reviewDate,
          rating: review.rating,
          photos: photos,
          reviewId: req.params.reviewId,
          isAuthor: review.userId === userId,
          isLogin: !!req.session.user,
          parkId: parkId,
          commentIndex: 0,
          favorite: false,
          helpers: {
            checkImage: validation.checkImage
          }
        })
      } else {
        const user = await getUserById(req.session.user.userId)
        const favorite = user.likedReviews.some(obj => obj === reviewId);
        res.render('review', {
          title: review.title,
          userName: review.userName,
          content: review.content,
          comment: commentsWithAuthCheck,
          reviewDate: review.reviewDate,
          rating: review.rating,
          photos: photos,
          reviewId: req.params.reviewId,
          isAuthor: review.userId === userId,
          isLogin: !!req.session.user,
          parkId: parkId,
          commentIndex: 0,
          favorite: favorite,
          helpers: {
            checkImage: validation.checkImage
          }
        })
      }   
    } catch (e) {
      res.status(404).render('error', { message: 'Page not Found' });
    }
  })
  .post(ensureLoggedIn, async (req, res) => {
    let reqObject = req.body;
    if (!reqObject || Object.keys(reqObject).length === 0) {
      return res.status(400).render('error', {
        message: 'There are no fields in the request body'
      });
    }
    const userId = req.session.user.userId;
    
    let title = reqObject['edit-title'];
    let content = reqObject['edit-content'];
    let rating = reqObject['edit-rating'];

    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);

      if (title)
        title = validation.checkString(title, 'Title', { min: '2', max: '20' });

      if (content)
        content = validation.checkString(content, 'Content', { min: '2', max: '200' });

      if (rating)
        rating = validation.checkRating(rating, 'Rating');
    } catch (e) {
      return res.status(400).render('error', {
        message: e.toString()
      });
    }

    let updateObject = {
      'title': title,
      'content': content,
      'rating': rating
    }

    try {
      const {parkId, review} = await reviewData.getReview(req.params.reviewId);
      if (review.userId !== userId) {
        return res.status(403).render('error', {
          message: "You do not have permission to edit this review."
        });
      }
      const updatedReview = await reviewData.updateReview(
        req.params.reviewId,
        updateObject
      )
    } catch (e) {
      res.status(500).render('error', { message: 'Internal Server Error' });
    }

    try {
      const {parkId, review} = await reviewData.getReview(req.params.reviewId);
      const isAuthor = req.session.user && (req.session.user.userId === review.userId);
      if (isAuthor) {
        res.redirect(`/review/${req.params.reviewId}`);
      }
      else {
        return res.status(400).render('error', {
          message: "Review edited failed"
        });
      }
    } catch (e) {
      return res.status(400).render('error', {
        message: "Review edited failed"
      });
    }
  })
  .delete(ensureLoggedIn, upload.none(), async (req, res) => {
    const userId = req.session.user.userId;
    try {
      req.params.reviewId = validation.checkId(req.params.reviewId)
    } catch (e) {
      res.status(404).render('error', { message: 'Page not Found' });
    }
    
    try {
      let {parkId, review} = await reviewData.getReview(req.params.reviewId);
      if (review.userId !== userId) {
        return res.status(403).render('error', {
          message: "You do not have permission to delete this review."
        });
      }
      let deletedReview = await reviewData.removeReview(req.params.reviewId);
      let deleteInfo = await deleteReviews(userId, req.params.reviewId);
      parkId = deletedReview._id.toString();
      res.json({redirectUrl: '/park/' + parkId});
    } catch (e) {
      res.status(500).render('error', { message: 'Internal Server Error' });
    }
  });

router
  .route('/review/:reviewId/addcomment')
  .post(ensureLoggedIn, async (req, res) => {
    let reqObj = req.body;

    let content = reqObj['commentContent'];

    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      res.status(404).render('error', { message: 'Page not Found' });
    }

    try {
      content = validation.checkString(content, 'Content', { min: '2', max: '200' });
    } catch(e) {
      return res.status(400).render('error', {
        message: e.toString()
      });
    }

    try {
      
      const newComment = await commentData.createComment(
        req.params.reviewId,
        req.session.user.userId,
        req.session.user.userName,
        content
      );

      const commentTouser = {
        commentId: newComment.commentId,
        content: content
      }
      const addInfo = await addToComments(req.session.user.userId, commentTouser)
      res.redirect(`/review/${req.params.reviewId}`);
    } catch (e) {
      res.status(500).render('error', { message: 'Internal Server Error' });
    }
  });

router
  .route('/review/:reviewId/comment/:commentId')
  .post(ensureLoggedIn, upload.none(), async (req, res) => {
    const userId = req.session.user.userId;
    let updateObject = req.body;
    if (!updateObject || Object.keys(updateObject).length === 0) {
      return res.status(400).render('error', {
        message: 'There are no fields in the request body'
      });
    }

    let { content } = updateObject;
    try {
      if (content)
        content = validation.checkString(content, 'Content', { min: '2', max: '200' });
    } catch (e) {
      return res.status(400).render('error', {
        message: e.toString()
      });
    }

    try {
      req.params.commentId = validation.checkId(req.params.commentId);
      req.params.reviewId = validation.checkId(req.params.reviewId);      
    } catch (e) {
      return res.status(400).render('error', {
        message: e.toString()
      });
    }

    try {
      const comment = await commentData.getComment(req.params.commentId);
      const isAuthor = req.session.user && (userId === comment.userId);
      if (!isAuthor) {
        return res.status(403).render('error', {
          message: "You do not have permission to edit this comment." 
        });
      }
    } catch (e) {
      return res.status(403).render('error', {
        message: e.toString()
      });
    }

    try{
      const updatedComment = await commentData.updateComment(
        req.params.commentId,
        updateObject
      );
      res.redirect(`/review/${req.params.reviewId}`);
    } catch (e) {
      res.status(500).render('error', { message: 'Internal Server Error' });
    }
  })
  .delete(ensureLoggedIn, upload.none(), async (req, res) => {
    const userId = req.session.user.userId;
    try {
      req.params.commentId = validation.checkId(req.params.commentId);
      req.params.reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      return res.status(400).render('error', {
        message: e.toString()
      });
    }
    
    try {
      const comment = await commentData.getComment(req.params.commentId);
      if (comment.userId !== userId) {
        return res.status(403).render('error', {
          message: "You do not have permission to delete this comment." 
        });
      }
      let deletedComment = await commentData.removeComment(req.params.commentId);
      const deleteinfo = await deleteComments(req.session.user.userId, req.params.commentId)
      res.json({redirectUrl: '/review/' + req.params.reviewId});
    } catch (e) {
      res.status(500).render('error', { message: 'Internal Server Error' });
    }
  })

router
  .route('/like/:reviewId')
  .post(ensureLoggedIn, async (req, res) => {
    const favorite = req.body.favorite;
    req.session.user.userId = validation.checkId(req.session.user.userId);
    req.params.reviewId = validation.checkId(req.params.reviewId);
    try {
      if (favorite) {
        const addtoLiked = await addToLiked(req.session.user.userId, req.params.reviewId)
        res.json({ favorited: favorite, message: "Favorite status updated successfully" });
      } else {
        const updatedUser = await deleteLiked(req.session.user.userId, req.params.reviewId);
        res.json({ favorited: favorite, message: "Favorite status updated successfully" });
      }
        
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

router
  .route('/like/:reviewId')
  .post(ensureLoggedIn, async (req, res) => {
    const favorite = req.body.favorite;
    req.session.user.userId = validation.checkId(req.session.user.userId);
    req.params.reviewId = validation.checkId(req.params.reviewId);
    try {
      if (favorite) {
        const addtoLiked = await addToLiked(req.session.user.userId, req.params.reviewId)
        res.json({ favorited: favorite, message: "Favorite status updated successfully" });
      } else {
        const updatedUser = await deleteLiked(req.session.user.userId, req.params.reviewId);
        res.json({ favorited: favorite, message: "Favorite status updated successfully" });
      }
        
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });


export default router;