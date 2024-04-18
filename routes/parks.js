//import express and express router as shown in lecture code and worked in previous labs.  Import your data functions from /data/movies.js that you will call in your routes below
import * as express from 'express';
const router = express.Router();

router.route('/').get(async (req, res) => {
  //code here for GET will render the home handlebars file
    try  {
        res.render('home');
    } catch (e) {
        res.status(500).json({error: e});
    }
});

export default router;
