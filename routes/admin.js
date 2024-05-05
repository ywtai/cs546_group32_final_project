import * as express from 'express';
import { parksData } from "../data/index.js";
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
                res.render('admin', { message: 'Start to sync.' });
            } else {
                res.status(400).render('error', { message: req.session.user.userName + " You do not have permission to this page."});
            }
        } catch (e) {
            res.status(500).json({ error: e });
        }
    });

router
    .route('/sync')
    .post(ensureLoggedIn, async (req, res) => {
        try {
            req.session.user.userId = validation.checkId(req.session.user.userId);
        } catch(e) {
            res.status(400).render('error', { message: 'Internal Server Error. Please try again later.'});
        }

        try {
            if (req.session.user.userName === 'admin') {
                const syncPark = await parksData.syncParkData();
                if (syncPark) {
                    res.render('admin', { message: 'Sync Complete!'});
                } else {
                    res.render('admin', { message: 'Fail to sync!'});
                }
            } else {
                res.status(400).render('error', { message: "You do not have permission to sync."});
            }

        } catch(e) {
            res.status(400).render('error', { message: 'Internal Server Error. Please try again later.'});
        }
    });


export default router;