//import express and express router as shown in lecture code and worked in previous labs.  Import your data functions from /data/movies.js that you will call in your routes below
import * as express from 'express';
import { searchByState, searchByActivity, searchByName, searchByCode } from '../data/searchPark.js';
import { parksData } from "../data/index.js";
import validation from "../validation.js";

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
    if (searchType === 'state') {
        try {
            const state = req.body.searchQuery.trim();
            if (!state) {
                return res.status(400).render('error', {error: "Please provide a state to search."});
            }
    
            const parkList = await searchByState(state);
            if (!parkList || parkList === 0) {
                res.status(404).render('error', {error : `We're sorry, but no results were found for "${state}".`});
            } else {
                res.render('parkSearchResults', {parks: parkList})
            }
        } catch (e) {
            res.status(500).json({error: e.message});
        }
    } else if (searchType === 'name') {
        try {
            const name = req.body.searchQuery.trim();
            if (!name) {
                return res.status(400).render('error', {error: "Please provide a name to search."});
            }
    
            const parkList = await searchByName(name);
            if (!parkList || parkList === 0) {
                res.status(404).render('error', {error : `We're sorry, but no results were found for "${name}".`});
            } else {
                res.render('parkSearchResults', {parks: parkList})
            }
        } catch (e) {
            res.status(500).json({error: e.message});
        }
    } else {
        try {
            const activities = req.body.searchQuery;
         
            if (!activities) {
                return res.status(400).render('error', {error: "Please provide a name to search."});
            }
            
            const parkList = await searchByActivity(activities);
            res.render('parkSearchResults', {parks: parkList})
        } catch (e) {
            console.log(e);
            res.status(500).json({error: e.message});
        }
    }
    
  });

router.route('/:id').get(async (req, res) => {
	let parkId = req.params.id;

	try {
		parkId = validation.checkId(parkId, 'id parameter in URL');
	} catch (e) {
		res.status(500).json({error: e.message});
	}

	const allData = [];

	try {
		const parkDetail = await parksData.getParkById(parkId);
		allData.push(parkDetail);

		//show the park detail page
		res.render('parkById', {
			htmlTitle: parkDetail.Title,
			parkData: allData,
		});
	} catch (e) {
		res.status(500).json({error: e.message});
	}
});

export default router;
