import * as express from 'express';
import { searchByState, searchByActivity, searchByName, searchTop5 } from '../data/searchPark.js';
import {parksData, reviewData} from "../data/index.js";
import validation from "../validation.js";

const router = express.Router();

router.get('/post/:title', async (req,res) => {
    let title = req.params.title;
    res.render('post', {
        pageTitle: 'Visit to Majestic Peaks',
        parkName: 'Abraham Lincoln Birthplace National Historical Park',
        postTitle: title,
        postDescription: 'This park is breathtaking, a must-visit for nature lovers!',
        comments: [
            { author: 'Alice', text: 'Absolutely agree! The view is stunning.' },
            { author: 'Bob', text: 'I plan to visit next month. Thanks for the tips!' }
        ]
    });
})
router.post('/update-description', async (req, res) => {
    // Logic to update the description
    res.json({ message: 'Description updated successfully!' });
});

router.post('/add-comment', (req, res) => {
    const { comment } = req.body;  // Assume the comment text is sent in the request body

    // Assuming you're saving the comment to a database
    // For demonstration, I'll skip database interaction and just simulate the addition
    const newComment = {
        author: "Alex", // This should be dynamically set based on the logged-in user
        text: comment,
        timestamp: validation.getFormatedDate(new Date()) // Optional: Add a timestamp if needed
    };

    // Simulate database operation
    // db.collection('comments').insertOne(newComment, (err, result) => {
    //     if (err) {
    //         res.status(500).json({ message: 'Failed to add comment' });
    //     } else {
    //         res.json(newComment); // Send the new comment back to the client
    //     }
    // });

    // Mock response for demonstration purposes
    res.json(newComment);
});

export default router;