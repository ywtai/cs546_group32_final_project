import parksRoutes from "./parks.js";
import authRoutes from './auth_routes.js';
import reviewsRoutes from "./reviews.js";
import adminRoutes from "./admin.js";

// import postsRoutes from"./posts.js";
const constructorMethod = (app) => {
    app.use('/', parksRoutes, reviewsRoutes);
    app.use('/auth', authRoutes);
    app.use('/admin', adminRoutes);

    app.use('*', (req, res) => {
        return res.status(404).render('error', { message: 'Page Not found' });
    });
};

export default constructorMethod;