// This data file should export all functions using the ES6 standard as shown in the lecture code
import { parks } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  async createReview(
    parkObjectId,
    userId,
    title,
    userName,
    content,
    photos,
    rating
  ) {
    let newReview = {
      _id: new ObjectId(),
      userId: userId,
      title: title,
      reviewDate: validation.getFormatedDate(new Date()),
      userName: userName,
      content: content,
      photos: photos,
      rating: rating,
      likes: 0,
      comments: []
    }

    if (Object.values(newReview).some(item => item === undefined || item === null))
      throw `Error: There are object missing for creating the review.`;

    parkObjectId = validation.checkId(parkObjectId);
    userId = validation.checkId(userId);
    title = validation.checkString(title, 'Title', { min: '2', max: '20' });
    userName = validation.checkString(userName, 'User Name');
    content = validation.checkString(content, 'Content', { min: '2', max: '200' });
    photos = validation.checkPhotos(photos);
    rating = validation.checkRating(rating, 'Rating');

    const parkCollection = await parks();
    const insertInfo = await parkCollection.findOneAndUpdate(
      {_id: new ObjectId(parkObjectId)},
        {
          $push: {reviews: newReview},
          $set: {averageRating: validation.calculateAverageRating([...(await parkCollection.findOne({ _id: new ObjectId(parkObjectId) })).reviews, newReview])}
        }
    );

    if (!insertInfo)
        throw 'Error: Could not add review';

    return {
      reviewSubmittedCompleted: true,
      reviewId : newReview._id.toString()
    };
  },

  async getAllReviews(parkObjectId) {
    parkObjectId = validation.checkId(parkObjectId);

    const parkCollection = await parks();
    let reviewsCollectionList = await parkCollection
      .find({_id: new ObjectId(parkObjectId)})
      .project({"_id": 0, "reviews": 1})
      .toArray();

    if (reviewsCollectionList === null) throw `Error: no park exists with id: "${parkObjectId}"`;
    
    const reviewsList = reviewsCollectionList[0].reviews;

    return reviewsList;
  },

  async getReview(reviewId) {
    reviewId = validation.checkId(reviewId);

    const parkCollection = await parks();
    const reviewInfo = await parkCollection.findOne(
      {"reviews._id": new ObjectId(reviewId)},
      {projection: {_id: 0, "reviews.$": 1}}  
    );

    if (reviewInfo === null) throw `Error: no review exists with id: "${reviewId}"`;

    const parkId = await parkCollection.findOne(
      {"reviews._id": new ObjectId(reviewId)},
      {projection: {_id: 1}}
    )

    const review = reviewInfo.reviews[0];

    return {
      parkId: parkId._id.toString(), 
      review: review
    };
  },

  async updateReview(reviewId, updateObject) {
    reviewId = validation.checkId(reviewId);
    let {title, content, rating} = updateObject;
    const updateReview = {};
    
    if (title) {
      title = validation.checkString(title, 'Title', { min: '2', max: '20' });
      updateReview["reviews.$.title"] = title;
    }
    if (content) {
      content = validation.checkString(content, 'Content', { min: '2', max: '200' });
      updateReview["reviews.$.content"] = content;
    }
    if (rating) {
      rating = validation.checkRating(rating, 'Rating');
      updateReview["reviews.$.rating"] = rating;
    }

    updateReview["reviews.$.reviewDate"] = validation.getFormatedDate(new Date());

    const parkCollection = await parks();
    const parkIdInfo = await parkCollection.findOne(
      {"reviews._id": new ObjectId(reviewId)},
      {projection: {_id: 1}}  
    );
    const parkId = parkIdInfo._id.toString(); 

    const reviewInfo = await parkCollection.findOneAndUpdate(
      {"reviews._id": new ObjectId(reviewId)},
      {$set: updateReview},
      {returnDocument: 'after'}  
    );

    if (!reviewInfo)
      throw `Error: Update failed, could not find a user with id of ${reviewId}`;

    const allReviewsInfo = await parkCollection.findOne(
      {_id: new ObjectId(parkId)},
      {projection: {_id: 0, "reviews": 1}}
    );
    const allReviews = allReviewsInfo.reviews;

    if (allReviews.length > 0) {
      const newAverageRating = validation.calculateAverageRating(allReviews);

      const updateAverageRating = await parkCollection.updateOne(
        {_id: new ObjectId(parkId)},
        {$set: {averageRating: newAverageRating}}
      );

      if (!updateAverageRating) throw `Error: Fail to update average rating`;
    }
    

    const updatedReviewInfo = await parkCollection.findOne(
      {_id: new ObjectId(parkId)},
    );

    return updatedReviewInfo;
  },

  async removeReview(reviewId) {
    reviewId = validation.checkId(reviewId);

    const parkCollection = await parks();
    const parkIdInfo = await parkCollection.findOne(
      {"reviews._id": new ObjectId(reviewId)},
      {projection: {_id: 1}}  
    );
    const parkId = parkIdInfo._id.toString();

    const deleteInfo = await parkCollection.findOneAndUpdate(
      {"reviews._id": new ObjectId(reviewId)},
      { $pull: { reviews: { _id: new ObjectId(reviewId) } } },
      { returnDocument: 'after' }
    );

    if (!deleteInfo)
      throw `Error: Update failed, could not find a review with id of ${reviewId}`;

    const allReviewsInfo = await parkCollection.findOne(
      {_id: new ObjectId(parkId)},
      {projection: {_id: 0, "reviews": 1}}
    );
    const allReviews = allReviewsInfo.reviews;

    let newAverageRating = 0;
    if (allReviews.length > 0) 
      newAverageRating = validation.calculateAverageRating(allReviews); 

    const updateAverageRating = await parkCollection.updateOne(
      {_id: new ObjectId(parkId)},
      {$set: {averageRating: newAverageRating}}
    );

    if (!updateAverageRating) throw `Error: Fail to update average rating`;

    const removedReviewInfo = await parkCollection.findOne(
      {_id: new ObjectId(parkId)},
    );

    return removedReviewInfo;
  }
}

export default exportedMethods;