
import Router from "express";
const router = Router();
import helpers from '../helpers.js';
import { loginUser, registerUser, deleteFavorite} from "../data/users.js";
import { logRequests, redirectBasedOnRole, ensureLoggedIn, ensureAdmin } from '../middleware.js'

router.use(logRequests);

router.route('/').get(async (req, res) => {
  redirectBasedOnRole(req, res);
});

router
  .route('/register')
  .get(async (req, res) => {
    res.render('register', { title: 'Register' });
  })
  .post(async (req, res) => {
    let { userName,
      email,
      dateOfBirth,
      password,
      confirmPassword,
      bio } = req.body;

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
        res.redirect('/auth/login')
      }
    } catch (e) {
      return res.status(500).render('error', { title: "Error", message: "Internal Server Error" })
    }
  });

router
  .route('/login')
  .get(async (req, res) => {
    res.render('login', { title: 'Login' });
  })
  .post(async (req, res) => {
    let { usernameOrEmail, password } = req.body;
    try {
      helpers.checkIfValid(usernameOrEmail, password)
    } catch (e) {
      return res.status(400).render('error', { title: "Error", message: e });
    }

    try {
      usernameOrEmail = helpers.checkuserNameorEmail(usernameOrEmail);
      password = helpers.checkPassword(password);


    } catch (e) {
      return res.status(400).render('error', { title: "Error", message: e });
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
        comments: user.comments
      }
      redirectBasedOnRole(req, res);
    } catch (e) {

      res.redirect('/auth/login');
      // return res.status(500).render('error', {title: "Error", message: e.message});
    }
  });

  // router
  // .route('/user')
  // .get(ensureLoggedIn, async (req, res) => {
  //   res.render('user', {
  //     title: "user",
  //     currentTime: new Date().toUTCString(),
  //     userId: req.session.user.userId,
  //     userName: req.session.user.userName,
  //     email: req.session.user.email,
  //     dateOfBirth: req.session.user.dateOfBirth,
  //     bio: req.session.user.bio,
  //     personalParkPassport: req.session.user.personalParkPassport,
  //     favorite: req.session.user.favorite,
  //     reviews: req.session.user.reviews,
  //     comments: req.session.user.comments
  //   })
  // })
  // .post(ensureLoggedIn, async (req, res) => {
  //   const parkId = req.body.parkId;
  //   const userId = req.session.user.userId;  // Make sure this matches how the session is stored
  //   try {
  //     const result = await deleteFavorite(userId, parkId);
  //     if (result) {
  //       res.redirect('/auth/user');  // Redirect to a specific page after deletion, e.g., a page showing remaining favorites
  //     } else {
  //       res.status(400).send('Failed to delete favorite');
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     res.status(500).send('Server error');
  //   }
  // });

  router.get('/user', ensureLoggedIn, (req, res) => {

  res.render('user', {

    title: "user",
    currentTime: new Date().toUTCString(),
    userId: req.session.user.userId,
    userName: req.session.user.userName,
    email: req.session.user.email,
    dateOfBirth: req.session.user.dateOfBirth,
    bio: req.session.user.bio,
    personalParkPassport: req.session.user.personalParkPassport,
    favorite: req.session.user.favorite,
    reviews: req.session.user.reviews,
    comments: req.session.user.comments
  })
});

router.route('/delete-favorite/:id').post(ensureLoggedIn, async (req, res) => {
  const parkId = req.body.parkId;
  const userId = req.session.user.userId;  // Adjust this if session storage format differs
  try {
    const result = await deleteFavorite(userId, parkId);
    if (result) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: "Failed to delete favorite" });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Server error" });
  }
});







router.route('/error').get(async (req, res) => {

  res.render('error', { message: "" })
});

router.route('/logout').get(async (req, res) => {

  res.clearCookie("AuthState")
  res.render('logout', {
    redirectUrl: '/'
  })
});

export default router;
