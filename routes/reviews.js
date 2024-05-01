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
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // Adjust the path to go up one directory level from routes to the project root
    callback(null, path.join(__dirname, '../public/icon'));
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

const router = Router();

router.use(logRequests);

router
  .route('/addReview/:parkObjectId')
  .get(async (req, res) => {
    // const { userName, favoriteQuote, role, themePreference } =
    //   req.session.user;
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
  .post(upload.single('photos'), ensureLoggedIn, async (req, res) => {
    let parkId = req.params.parkObjectId;
    let reviewInfo = req.body;
    let startIndex = req.file.path.indexOf('/public');
    let webPath = req.file.path.substring(startIndex);
    reviewInfo.photos = webPath;
    if (!reviewInfo || Object.keys(reviewInfo).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }

    let { title, content, photos, rating } = reviewInfo;

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
        photos,
        rating
      );

      // return res.status(201).json({
      //     success: true,
      //     message: 'Review added successfully',
      //     data: {
      //         userName:req.
      //     }
      // });
      res.render('reviewSubmitted', {
        documentTitle: 'Review Submitted',
        parkId: parkId
      });
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
      req.params.reviewId = validation.checkId(req.params.reviewId);
      // req.params.parkId = validation.checkId(req.params.parkId);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
    try {
      const review = await reviewData.getReview(req.params.reviewId);
      if (!req.session.user) {
        res.render('review', {
          title: review.title,
          userName: review.userName,
          content: review.content,
          comment: review.comment,
          reviewDate: review.reviewDate,
          rating: review.rating,
          photos: review.photos,
          reviewId: req.params.reviewId,
          isLogin: false,
          parkId: req.params.parkId
        })
      } else {
        res.render('review', {
          title: review.title,
          userName: review.userName,
          content: review.content,
          comment: review.comments,
          reviewDate: review.reviewDate,
          rating: review.rating,
          photos: review.photos,
          reviewId: req.params.reviewId,
          isLogin: true
          // parkId:req.params.parkId
        })
      }
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .post(async (req, res) => {
    let updateObject = req.body;
    if (!updateObject || Object.keys(updateObject).length === 0) {
      return res
        .status(400)
        .json({ error: 'There are no fields in the request body' });
    }

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
      const updatedReview = await reviewData.updateReview(
        req.params.reviewId,
        updateObject
      );
      return res.json(updatedReview);
    } catch (e) {
      return res.status(404).send({ error: e });
    }
  })
  .delete(upload.none(), async (req, res) => {
    // try {
    //   req.params.reviewId = validation.checkId(req.params.reviewId);
    // } catch (e) {
    //   return res.status(400).json({error: e});
    // }
    //
    // try {
    //   let deletedReview = await reviewData.removeReview(req.params.reviewId);
    //   return res.json(deletedReview);
    // } catch (e) {
    //   return res.status(404).send({error: e});
    // }
    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    try {
      let deletedReview = await reviewData.removeReview(req.params.reviewId);
      return res.json({ success: true, message: 'Review deleted successfully', data: deletedReview });
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
        documentTitle: 'Add Review',
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

    // if (!userId || !userName || !content) {
    //   return res.status(400).json({ error: 'Missing one or more of the required fields: userId, userName, content.' });
    // }

    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);
      // userId = validation.checkId(userId);
      // userName = validation.checkString(userName, 'User Name');
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
      return res.status(201).json(newComment);
    } catch (e) {
      return res.status(500).json({ error: e });
    }
  });

router
  .route(ensureLoggedIn, '/review/:reviewId/comment/:commentId')
  .get(async (req, res) => {
    let commentId = validation.checkId(req.params.commentId);

    try {
      const comment = await commentData.getComment(commentId);
      return res.json(comment);
    } catch (e) {
      return res.status(404).json({ error: 'Comment not found or could not be retrieved' });
    }
  })
  .patch(upload.none(), async (req, res) => {
    let commentId = validation.checkId(req.params.commentId);
    let updateObject = req.body;
    if (!updateObject || Object.keys(updateObject).length === 0) {
      return res.status(400).json({ error: 'There are no fields in the request body' });
    }

    let { content } = updateObject;

    try {
      if (content)
        content = validation.checkString(content, 'Content');

    } catch (e) {
      return res.status(400).json({ error: e });
    }

    try {
      const updatedComment = await commentData.updateComment(
        commentId,
        updateObject
      );
      return res.json(updatedComment);
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })
  .delete(upload.none(), async (req, res) => {
    let commentId = validation.checkId(req.params.commentId);

    try {
      await commentData.removeComment(commentId);
      return res.status(204).send();
    } catch (e) {
      return res.status(404).json({ error: e });
    }
  })


export default router;