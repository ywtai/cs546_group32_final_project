//import express and express router as shown in lecture code and worked in previous labs.  Import your data functions from /data/movies.js that you will call in your routes below
import * as express from 'express';
import { parksData, searchData } from "../data/index.js";
import validation from "../validation.js";
import {ensureLoggedIn, logRequests} from '../middleware.js'
import {addToFavorites, deleteFavorite, addToPassport, getUserById} from '../data/users.js';
import xss from 'xss'

const router = express.Router();
router.use(logRequests);

function createStarRatingHTML(rating) {
    const roundedRating = Math.round(rating * 2) / 2;  
    let starsHTML = '';

    for (let i = 0; i < Math.floor(roundedRating); i++) {
        starsHTML += '<span class="star full">&#9733;</span>'; 
    }

    if (roundedRating % 1 !== 0) {
        starsHTML += '<span class="star half">&#9733;</span>'; 
    }

    for (let i = Math.ceil(roundedRating); i < 5; i++) {
        starsHTML += '<span class="star empty">&#9733;</span>'; 
    }

    return starsHTML;
}


router.route('/').get(async (req, res) => {
    //code here for GET will render the home handlebars file
    try {
        const top5 = await searchData.searchTop5();
        res.render('home', { top5: top5 });
    } catch (e) {
        res.status(500).render('error', { message: e });
    }
});

router.route('/searchparks')
    .get(async (req, res) => {
        const searchType = xss(req.query.searchType);
        const searchQuery = xss(req.query.searchQuery);
        const page = parseInt(req.query.page) || 1;
        const pageSize = 20; // Number of results per page
        const offset = (page - 1) * pageSize;

        try {
            let parkList = [];
            let totalParks = 0;
            switch (searchType) {
                case 'state':
                    const state = searchQuery.trim();

                    if (!state) {
                        throw new Error("Please provide a state to search.");
                    }
                    [parkList, totalParks] = await searchData.searchByState(state, pageSize, offset);
                    break;

                case 'name':
                    const name = searchQuery.trim();
                    if (!name) {
                        throw new Error("Please provide a name to search.");
                    }
                    [parkList, totalParks] = await searchData.searchByName(name, pageSize, offset);
                    break;

                case 'activity':
                    const activities = searchQuery;
                    if (!activities || activities.length === 0) {
                        throw new Error("Please select at least one activity to search.");
                    }
                    [parkList, totalParks] = await searchData.searchByActivity(activities, pageSize, offset);
                    break;

                default:
                    throw new Error("Invalid search type provided.");
            }

            if (parkList.length === 0) {
                res.status(404).render('error', { message: `We're sorry, but no results were found.` });
            } else {
                const totalPages = Math.ceil(totalParks / pageSize);
                const hasPreviousPage = page > 1;
                const hasNextPage = page < totalPages;
                const previousPage = hasPreviousPage ? page - 1 : null;
                const nextPage = hasNextPage ? page + 1 : null;

                let pages = [];
                for (let i = 1; i <= totalPages; i++) {
                    pages.push({
                        number: i,
                        isActive: i === page
                    });
                }

                let pagesFirst3 = [];
                let pagesLast3 = [];
                let pagesCur3 = [];
                let overPage = false;
                let showFirstEllipsis = false;
                let showLastEllipsis = false;
                if (totalPages > 8) {
                    overPage = true;
                    const firstPages = [1, 2, 3];
                    const lastPages = [totalPages - 2, totalPages - 1, totalPages];
                    let middlePages = [];

                    showFirstEllipsis = page > 4;
                    showLastEllipsis = page < (totalPages - 3);

                    if (page <= 4) {
                        middlePages = [4, 5, 6].filter(p => !lastPages.includes(p));
                        showFirstEllipsis = false;
                        showLastEllipsis = true;
                    } else if (page >= totalPages - 3) {
                        middlePages = [totalPages - 3, totalPages - 4, totalPages - 5].reverse().filter(p => !firstPages.includes(p));
                        showFirstEllipsis = true;
                        showLastEllipsis = false;
                    } else {
                        middlePages = [page - 1, page, page + 1];
                    }

                    pagesFirst3 = firstPages.map(num => ({
                        number: num,
                        isActive: num === page
                    }));

                    pagesLast3 = lastPages.map(num => ({
                        number: num,
                        isActive: num === page
                    }));

                    pagesCur3 = middlePages.map(num => ({
                        number: num,
                        isActive: num === page
                    }));
                }

                res.render('parkSearchResults', {
                    parks: parkList,
                    currentPage: page,
                    pages: pages,
                    previousPage: previousPage,
                    nextPage: nextPage,
                    hasPreviousPage: hasPreviousPage,
                    hasNextPage: hasNextPage,
                    searchType: searchType,
                    searchQuery: searchQuery,
                    pagesFirst3: pagesFirst3,
                    pagesLast3: pagesLast3,
                    pagesCur3: pagesCur3,
                    overPage: overPage,
                    showFirstEllipsis: showFirstEllipsis,
                    showLastEllipsis: showLastEllipsis,
                }
                );
            }
        } catch (e) {
            console.error(e);
            res.status(500).render('error', { message: 'Internal Server Error. Please try again later.' });
        }
    })
    .post(async (req, res) => {

    });

router.route('/park/:id')
    .get(async (req, res) => {
        let parkId = xss(req.params.id);
        try {
            parkId = validation.checkId(parkId, 'id parameter in URL');
            const allData = [];

            const parkDetail = await parksData.getParkById(parkId);
            const parkName = parkDetail.parkName;
            const ratedPeople = parkDetail.reviews.length;
            const starsHTML = createStarRatingHTML(parkDetail.averageRating);
          
            allData.push(parkDetail);

            if (parkDetail) {
                //show the park detail page
                if (!req.session.user) {
                    res.render('parkById', {
                    parkId: parkId,
                    parkData: allData,
                    parkName: parkName,
                    isLogin: false,
                    favorite: false,
                    ratedPeople: ratedPeople,
                      starsHTML: starsHTML,
                      averageRating: parseFloat(parkDetail.averageRating.toFixed(1)),
                    photos: parkDetail.photos
                    });
                } else {
                    const user = await getUserById(req.session.user.userId)
                  const favorite = user.favorite.some(obj => obj.parkId === parkId)
                    res.render('parkById', {
                        parkId: parkId,
                        parkData: allData,
                        parkName: parkName,
                        isLogin: true,
                        userId: req.session.user.userId,
                        userName: req.session.user.userName,
                      favorite: favorite,
                      ratedPeople: ratedPeople,
                      starsHTML: starsHTML,
                      averageRating: parseFloat(parkDetail.averageRating.toFixed(1)),
                    photos: parkDetail.photos          
                    });
                }
            } else {
                res.status(400).render('error', { message: e.message });
            }
        } catch (e) {
            res.status(500).render('error', { message: e.message });
        }
    });

router.route('/favorite/:id')
    .post(ensureLoggedIn, async (req, res) => {
    
      let parkId = xss(req.params.id);
      parkId = validation.checkId(parkId);
      let favorite = xss(req.body.favorite);
      let parkName = xss(req.body.parkName);

        const park = {
            parkId: parkId,
            parkName: parkName,
        }

        try {
            if (favorite) {
            const updatedUser = await addToFavorites(req.session.user.userId, park);
            res.json({ favorited: favorite, message: "Favorite status updated successfully" });
            } else {
            const updatedUser = await deleteFavorite(req.session.user.userId, parkId);
            res.json({ favorited: favorite, message: "Favorite status updated successfully" });
            }
            
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

router.post('/passport/add/:id', ensureLoggedIn, async (req, res) => {
    const visitDate = xss(req.body.visitDate);
    const userId = req.session.user.userId; 
    const parkId = xss(req.params.id)
    const park = {
        parkId: parkId,
        visitDate: visitDate
    }

  try {
    const user = await getUserById(userId)
    if (user.personalParkPassport.some(obj => obj.parkId === parkId)) {
      res.json({ added: false, message: "Park already exists." })
    } else {
      const addedToPassport = await addToPassport(userId, park);
      res.json({ added: true, message: "Park added to passport successfully." });
    }
  } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

export default router;
