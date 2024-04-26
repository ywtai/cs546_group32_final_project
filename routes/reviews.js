// Import the express router as shown in the lecture code
// Note: please do not forget to export the router!
import { Router } from 'express';
import { reviewData } from "../data/index.js";
import validation from '../validation.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router
  .route('/addReview/:parkObjectId')
  .get(async (req, res) => {
		let parkId = req.params.parkObjectId;

		try {
			parkId = validation.checkId(parkId, 'id parameter in URL');
			res.render('addReview', { 
				documentTitle: 'Add Review',
				parkId: parkId
			});
		} catch (e) {
			res.status(500).json({error: e.message});
			if (!res.headersSent) {
        res.status(500).send("Error processing your request.");
      }
		}
	})
  .post(upload.none(), async (req, res) => {
		let parkId = req.params.parkObjectId;
    let reviewInfo = req.body;

    if (!reviewInfo || Object.keys(reviewInfo).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }

    let {userId, title, userName, content, photos, rating} = reviewInfo;

    try {
      req.params.parkObjectId = validation.checkId(req.params.parkObjectId);
      title = validation.checkString(title, 'Title');
      content = validation.checkString(content, 'Content');
      rating = validation.checkRating(rating, 'Rating');
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const { reviewSubmittedCompleted } = await reviewData.createReview(
        req.params.parkObjectId,
        userId,
        title,
        userName,
        content,
        photos,
        rating
      );
			if (reviewSubmittedCompleted) {
				res.render('reviewSubmitted', { 
					documentTitle: 'Review Submitted',
					parkId: parkId
				});
			}
			else {
				res.render('error', { error: 'Fail to submit' });
        res.status(500);
			}
    } catch (e) {
      return res.status(500).json({error: e});
    }
  });

router
  .route('/review/:reviewId')
  .get(async (req, res) => {
    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      return res.status(500).json({error: e});
    }
    try {
      const review = await reviewData.getReview(req.params.reviewId);
      return res.json(review);
    } catch (e) {
      return res.status(404).json({error: e});
    } 
  })
  .patch(async (req, res) => {
    let updateObject = req.body;
    if (!updateObject || Object.keys(updateObject).length === 0) {
      return res
        .status(400)
        .json({error: 'There are no fields in the request body'});
    }

    let {title, content, rating} = updateObject;

    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);

      if (title)
        title = validation.checkString(title, 'Title');
      
      if (content)
        content = validation.checkString(content, 'Content');

      if (rating)
          rating = validation.checkRating(rating, 'Rating');

    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      const updatedReview = await reviewData.updateReview(
        req.params.reviewId,
        updateObject
      );
      return res.json(updatedReview);
    } catch (e) {
      return res.status(404).send({error: e});
    }
  })
  .delete(async (req, res) => {
    try {
      req.params.reviewId = validation.checkId(req.params.reviewId);
    } catch (e) {
      return res.status(400).json({error: e});
    }

    try {
      let deletedReview = await reviewData.removeReview(req.params.reviewId);
      return res.json(deletedReview);
    } catch (e) {
      return res.status(404).send({error: e});
    }
  });

export default router;