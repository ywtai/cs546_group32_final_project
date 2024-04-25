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

router.route('/searchparks')
.get(async (req, res) => {
    const searchType = req.query.searchType;
    const searchQuery = req.query.searchQuery;
    const page  = parseInt(req.query.page) || 1;
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
                [parkList, totalParks] = await searchByState(state, pageSize, offset);
                break;

            case 'name':
                const name = searchQuery.trim();
                if (!name) {
                    throw new Error("Please provide a name to search.");
                }
                [parkList, totalParks] = await searchByName(name, pageSize, offset);
                break;

            case 'activity':
                const activities = searchQuery;
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
            let showCur3 = false;
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
            
            res.render('parkSearchResults', { parks: parkList,
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
        res.status(500).render('error', { error: 'Internal Server Error. Please try again later.' });
    }
})
.post(async (req, res) => {
    
});

export default router;
