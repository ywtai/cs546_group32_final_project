//import express and express router as shown in lecture code and worked in previous labs.  Import your data functions from /data/movies.js that you will call in your routes below
import * as express from 'express';
import { searchByState, searchByActivity, searchByName, searchByCode } from '../data/searchPark.js';

const router = express.Router();

router.route('/').get(async (req, res) => {
  //code here for GET will render the home handlebars file
    try  {
        res.render('home');
    } catch (e) {
        res.status(500).json({error: e});
    }
});

router.route('/searchparks').post(async (req, res) => {
    //code here for POST this is where your form will be submitting searchMoviesByName and then call your data function passing in the searchMoviesByName and then rendering the search results of up to 20 Movies.
    const searchType = req.body.searchType;

    try {
        let parkList = [];
        switch (searchType) {
            case 'state':
                const state = req.body.searchQuery.trim();
                if (!state) {
                    throw new Error("Please provide a state to search.");
                }
                parkList = await searchByState(state);
                break;

            case 'name':
                const name = req.body.searchQuery.trim();
                if (!name) {
                    throw new Error("Please provide a name to search.");
                }
                parkList = await searchByName(name);
                break;

            case 'activity':
                const activities = req.body.searchQuery;
                if (!activities || activities.length === 0) {
                    throw new Error("Please select at least one activity to search.");
                }
                parkList = await searchByActivity(activities);
                break;

            default:
                throw new Error("Invalid search type provided.");
        }

        if (parkList.length === 0) {
            res.status(404).render('error', { error: `We're sorry, but no results were found.` });
        } else {
            res.render('parkSearchResults', { parks: parkList });
        }
    } catch (e) {
        if (e.message.includes("Please")) {
            res.status(400).render('error', { error: e.message });
        } else {
            console.error(e);
            res.status(500).render('error', { error: 'Internal Server Error. Please try again later.' });
        }
    }
    
  });

export default router;
