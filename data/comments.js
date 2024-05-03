// This data file should export all functions using the ES6 standard as shown in the lecture code
import { parks } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import validation from '../validation.js';

const exportedMethods = {
  async createComment(
    reviewId,
    userId,
    userName,
    content,
  ) {
    let newComment = {
      _id: new ObjectId(),
      userId: userId,
      commentDate: validation.getFormatedDate(new Date()),
      userName: userName,
      content: content,
    }

    if (Object.values(newComment).some(item => item === undefined || item === null))
      throw `Error: There are object missing for creating the comment.`;

    reviewId = validation.checkId(reviewId);
    userId = validation.checkId(userId);
    userName = validation.checkString(userName, 'User Name');
    content = validation.checkString(content, 'Content', { min: '2', max: '200' });

    const parkCollection = await parks();
    const insertInfo = await parkCollection.findOneAndUpdate(
      {"reviews._id": new ObjectId(reviewId)},
			{
				$push: {"reviews.$.comments": newComment}
			}
    );

    if (!insertInfo)
        throw 'Error: Could not add comment';

    return {commentSubmittedCompleted: true};
  },

  async getAllComments(reviewId) {
    reviewId = validation.checkId(reviewId);

    const parkCollection = await parks();
		const commentsCollectionList = await parkCollection
		.aggregate([
				{ $match: { "reviews._id": new ObjectId(reviewId) } },
				{ $unwind: "$reviews" },
				{ $match: { "reviews._id": new ObjectId(reviewId) } },
				{ $project: { "reviews.comments": 1, _id: 0 } }
		])
		.toArray();

    if (commentsCollectionList === null) throw `Error: no review exists with id: "${reviewId}"`;
    
    const commentsList = commentsCollectionList[0].reviews.comments;

    return commentsList;
  },

  async getComment(commentId) {
    commentId = validation.checkId(commentId);

    const parkCollection = await parks();
    const commentInfo = await parkCollection.aggregate([
			{ $unwind: "$reviews" },
			{ $unwind: "$reviews.comments" },
			{ $match: { "reviews.comments._id": new ObjectId(commentId) } },
			{ $project: { _id: 0, comment: "$reviews.comments" } }
		]).toArray();

    if (commentInfo === null) throw `Error: no comment exists with id: "${commentId}"`;

    const comment = commentInfo[0].comment;

    return comment;
  },

  async updateComment(commentId, updateObject) {
    commentId = validation.checkId(commentId);
    let {content} = updateObject;
    const updateFields = {};

    const parkCollection = await parks();

    if (content) {
      content = validation.checkString(content, 'Content', { min: '2', max: '200' });
      updateFields["reviews.$[].comments.$[c].content"] = content;
    }

    updateFields["reviews.$[].comments.$[c].commentDate"] = validation.getFormatedDate(new Date());

    const updateCommentInfo = await parkCollection.updateOne(
      { "reviews.comments._id": new ObjectId(commentId) },
      { $set: updateFields },
      {arrayFilters : [{"c._id": new ObjectId(commentId)}]}
    );
    
		if (!updateCommentInfo || updateCommentInfo.matchedCount === 0) {
			throw new Error(`Error: Update failed, could not find a comment with id of ${commentId}`);
		}

		const updatedComment = await parkCollection.findOne({"reviews.comments._id": new ObjectId(commentId)});
    if (!updatedComment) {
        throw new Error(`Error: Failed to retrieve the updated comment for comment id ${commentId}`);
    }

    return updatedComment;
  },

  async removeComment(commentId) {
    commentId = validation.checkId(commentId);

    const parkCollection = await parks();
    const deleteInfo = await parkCollection.updateOne(
			{ "reviews.comments._id": new ObjectId(commentId) },
			{ $pull: { "reviews.$.comments": { _id: new ObjectId(commentId) } } }
	);

    if (!deleteInfo)
      throw `Error: Update failed, could not find a comment with id of ${commentId}`;

    const removedCommentInfo = await parkCollection.findOne(
      {"reviews.comments._id": new ObjectId(commentId)},
    );

    return removedCommentInfo;
  }
}

export default exportedMethods;