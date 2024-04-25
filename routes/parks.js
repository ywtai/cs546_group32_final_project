//import express and express router as shown in lecture code and worked in previous labs.  Import your data functions from /data/movies.js that you will call in your routes below
import * as express from 'express';
import { searchByState, searchByActivity, searchByName, searchTop5 } from '../data/searchPark.js';

const router = express.Router();

router.route('/').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try  {
        const top5 = await searchTop5();
        res.render('home', {top5: top5});
    } catch (e) {
        res.status(500).json({error: e});
    }
});

router.route('/searchparks').post(async (req, res) => {
    //code here for POST this is where your form will be submitting searchMoviesByName and then call your data function passing in the searchMoviesByName and then rendering the search results of up to 20 Movies.
    const searchType = req.body.searchType;
    const page  = parseInt(req.query.page) || 1;
    const pageSize = 20; // Number of results per page
    const offset = (page - 1) * pageSize;

    try {
        let parkList = [];
        let totalParks = 0;
        switch (searchType) {
            case 'state':
                const state = req.body.searchQuery.trim();
                if (!state) {
                    throw new Error("Please provide a state to search.");
                }
                [parkList, totalParks] = await searchByState(state, pageSize, offset);
                break;

            case 'name':
                const name = req.body.searchQuery.trim();
                if (!name) {
                    throw new Error("Please provide a name to search.");
                }
                [parkList, totalParks] = await searchByName(name, pageSize, offset);
                break;

            case 'activity':
                const activities = req.body.searchQuery;
                if (!activities || activities.length === 0) {
                    throw new Error("Please select at least one activity to search.");
                }
                [parkList, totalParks] = await searchByActivity(activities, pageSize, offset);
                break;

            default:
                throw new Error("Invalid search type provided.");
        }

        if (parkList.length === 0) {
            res.status(404).render('error', { error: `We're sorry, but no results were found.` });
        } else {
            const totalPages = Math.ceil(totalParks / pageSize);
            res.render('parkSearchResults', { parks: parkList, currentPage: page, totalPages });
        }
    } catch (e) {
        console.error(e);
        res.status(500).render('error', { error: 'Internal Server Error. Please try again later.' });
    }
});

export default router;
