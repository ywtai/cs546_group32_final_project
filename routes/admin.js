import * as express from 'express';
import { parksData, searchData } from "../data/index.js";
import validation from "../validation.js";
import {ensureLoggedIn, logRequests} from '../middleware.js'

const router = express.Router();
router.use(logRequests);

router.route('/')
    .get(ensureLoggedIn, async (req, res) => {
        try {
            req.session.user.userId = validation.checkId(req.session.user.userId);
        } catch(e) {
            res.status(400).render('error', { message: 'Internal Server Error. Please try again later.'});
        }
        
        try {
            if (req.session.user.userName === 'admin') {
                res.render('admin', { message: 'Start to sync.',
                                        currentTime: new Date().toUTCString(),
                                        userId: req.session.user.userId,
                                        userName: req.session.user.userName,
                                        email: req.session.user.email,
                                        dateOfBirth: req.session.user.dateOfBirth,
                                        bio: req.session.user.bio, 
            });
            } else {
                res.status(400).render('error', { message: req.session.user.userName + " You do not have permission to this page."});
            }
        } catch (e) {
            res.status(500).json({ error: e });
        }
    });

router
    .route('/sync')
    .get(ensureLoggedIn, async (req, res) => {
        try {
            if (req.session.user.userName === 'admin') {
            res.redirect('/admin');
        } else {
            res.status(400).render('error', { message: req.session.user.userName + " You do not have permission to this page."});
        }} catch(e) {
            res.status(400).render('error', { message: 'Internal Server Error. Please try again later.'});
        }
    })
    .post(ensureLoggedIn, async (req, res) => {
        try {
            req.session.user.userId = validation.checkId(req.session.user.userId);
        } catch(e) {
            res.status(400).render('error', { message: 'Internal Server Error. Please try again later.',
                                            currentTime: new Date().toUTCString(),
                                            userId: req.session.user.userId,
                                            userName: req.session.user.userName,
                                            email: req.session.user.email,
                                            dateOfBirth: req.session.user.dateOfBirth,
                                            bio: req.session.user.bio, })
        }

        try {
            if (req.session.user.userName === 'admin') {
                const syncPark = await parksData.syncParkData();
                if (syncPark) {
                    res.render('admin', { message: 'Sync Complete!',
                    currentTime: new Date().toUTCString(),
                    userId: req.session.user.userId,
                    userName: req.session.user.userName,
                    email: req.session.user.email,
                    dateOfBirth: req.session.user.dateOfBirth,
                    bio: req.session.user.bio, });
                } else {
                    res.render('admin', { message: 'Fail to sync!',
                    currentTime: new Date().toUTCString(),
                    userId: req.session.user.userId,
                    userName: req.session.user.userName,
                    email: req.session.user.email,
                    dateOfBirth: req.session.user.dateOfBirth,
                    bio: req.session.user.bio, });
                }
            } else {
                res.status(400).render('error', { message: "You do not have permission to sync."});
            }

        } catch(e) {
            res.status(400).render('error', { message: 'Internal Server Error. Please try again later.'});
        }
    });

router.get('/search', async(req, res) => {
    const searchQuery = req.query.searchQuery;
    const name = searchQuery.trim();
    let parkList = [];
    let totalParks = 0;
    if (!name) {
        throw new Error("Please provide a name to search.");
    }
    [parkList, totalParks] = await searchData.searchByName(name, 10, 0);
    res.json({ parkList });
    })
      

export default router;