
import Router from "express";
const router = Router();
import helpers from '../helpers.js';
import validation from '../validation.js';
import { loginUser, registerUser, deleteFavorite, deleteParkFromPassport, getUserById} from "../data/users.js";

import { logRequests, redirectBasedOnRole, ensureLoggedIn, ensureNotLoggedIn, captureUrl} from '../middleware.js'
import { parksData, reviewData, searchData} from "../data/index.js";
import {users} from '../config/mongoCollections.js';
import xss from 'xss';
import helmet from 'helmet';

router.use(logRequests);

router.route('/').get(async (req, res) => {
  redirectBasedOnRole(req, res);
});

router
  .route('/register')
  .get(ensureNotLoggedIn, async (req, res) => {
    res.render('register', { title: 'Register' });
  })
  .post(async (req, res) => {
    let { userName,
      email,
      dateOfBirth,
      password,
      confirmPassword,
      bio } = req.body;

    userName = xss(userName);
    email = xss(email);
    dateOfBirth = xss(dateOfBirth);
    bio = xss(bio);
    password = xss(password);
    confirmPassword = xss(confirmPassword);
    let errors =[];
    const userCollection = await users(); 
    const checkEmailExisted = await userCollection.findOne({ email: email });
    if (checkEmailExisted) errors.push( 'Error: A user with this email already exists!');
    const checkUserExisted = await userCollection.findOne({ userName: userName });
    if (checkUserExisted) errors.push( 'Error: A user with this userName already exists!');
    if(errors.length > 0){
    return res.render('register', {title: "Register", errors: errors})}

    try {
      helpers.checkIfValid(userName,
        email,
        dateOfBirth,
        bio,
        password,
        confirmPassword)
    } catch (e) {
      return res.status(400).render('error', { title: "Error", message: e })
    };

    try {
      userName = helpers.checkuserName(userName);
      email = helpers.checkEmail(email);
      dateOfBirth = helpers.checkDateOfBirth(dateOfBirth);
      bio = helpers.checkbio(bio);
      password = helpers.checkPassword(password);
      confirmPassword = helpers.checkPassword(confirmPassword);
      if (password !== confirmPassword) throw 'Password are not match'
    } catch (e) {
      return res.status(400).render('error', { title: "Error", message: e });
    }

    try {
      const user = await registerUser(userName,
        email,
        dateOfBirth,
        bio,
        password);
      if (user.insertedUser) {
        res.redirect('/auth/login');
      }
    } catch (e) {
      return res.status(500).render('error', { title: "Error", message: "Internal Server Error" })
    }
  });

router
  .route('/login')
  .get(captureUrl, ensureNotLoggedIn, async (req, res) => {
    res.render('login', { title: 'Login' });
  })
  .post(async (req, res) => {
    let { usernameOrEmail, password } = req.body;

    usernameOrEmail = xss(usernameOrEmail);
    password = xss(password);
    try {
      helpers.checkIfValid(usernameOrEmail, password)
    } catch (e) {
      return res.status(400).render('login', { title: "Login", message: e });
    }

    try {
      usernameOrEmail = helpers.checkuserNameorEmail(usernameOrEmail);
      password = helpers.checkPassword(password);


    } catch (e) {
      return res.status(400).render('login', {title: "Login", message: e });
    }

    try {
      const user = await loginUser(usernameOrEmail, password);
      req.session.user = {
        userId: user.userId,
        userName: user.userName,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        bio: user.bio,
        personalParkPassport: user.personalParkPassport,
        favorite: user.favorite,
        reviews: user.reviews,
        likedReviews: user.likedReviews,
        comments: user.comments
      }
      const previousUrl = req.session.previousUrl || '/';
      res.redirect(previousUrl);
    } catch (e) {
      const ifError = e !== undefined;
      return res.status(500).render('login', {ifError: ifError, error: e});
    }
  });

router.get('/user', ensureLoggedIn, async(req, res) => {
  const user = await getUserById(req.session.user.userId);
  if (user.userName == 'admin') {
    res.redirect('/admin');
  }

  try {
      const user = await getUserById(req.session.user.userId);

      if (user.userName === 'admin') {
        res.redirect('/admin');
      }

      const parksPromises = user.personalParkPassport.map(async (tmp) => {
          const passportPark = await parksData.getParkById(tmp.parkId);
          return {
              parkId: tmp.parkId,
              parkName: passportPark.parkName,
              state: passportPark.state,
              photos: passportPark.photos,
              visitDate: tmp.visitDate,
          };
      });
      const personalParkPassportParks = await Promise.all(parksPromises);

      req.session.user.favorite = user.favorite;
      req.session.user.personalParkPassport = personalParkPassportParks;
      req.session.user.reviews = user.reviews;
      req.session.user.likedReviews = user.likedReviews;
      let reviews = req.session.user.reviews;
      for (let i=0; i<reviews.length; i++) {
        let newReview = (await reviewData.getReview(reviews[i].reviewId)).review;
        reviews[i]['photo'] = newReview.photos?.[0] ?? '';
        reviews[i]['title'] = newReview.title;
        reviews[i]['reviewDate'] = newReview.reviewDate;
      }

  res.render('user', {

    currentTime: new Date().toUTCString(),
    userId: req.session.user.userId,
    userName: xss(req.session.user.userName),
    email: xss(req.session.user.email),
    dateOfBirth: xss(req.session.user.dateOfBirth),
    bio: xss(req.session.user.bio),
    personalParkPassport: req.session.user.personalParkPassport,
    favorite: req.session.user.favorite,
    reviews: reviews,
    likedReviews: req.session.user.likedReviews,
    comments: req.session.user.comments
  })
} catch (error) {
  console.error(error);
  return res.status(500).render('error', { title: "Error", message: error })
}
});

router.route('/delete-favorite/:id').post(ensureLoggedIn, async (req, res) => {
  const parkId = xss(req.body.parkId);
  const userId = req.session.user.userId;  
  try {
    const result = await deleteFavorite(userId, parkId);
    if (result) {
      req.session.user.favorite = req.session.user.favorite.filter(id => id !== parkId);
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Failed to delete favorite" });
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/delete-passport-park', ensureLoggedIn, async (req, res) => {
  const parkId = xss(req.body.parkId);
  const userId = req.session.user.userId;    
  try {
    const result = await deleteParkFromPassport(userId, parkId);
    if (result) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Failed to delete park from passport" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.route('/error').get(async (req, res) => {

  res.render('error', { message: "" })
});


router.route('/logout').get(async (req, res) => {
  const previousUrl = req.headers.originalUrl || '/'; 
  req.session.destroy(); 
  res.clearCookie('AuthState'); 
  res.redirect('/')

});




export default router;
