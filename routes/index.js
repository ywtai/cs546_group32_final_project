import parksRoutes from "./parks.js"
import authRoutes from './auth_routes.js';
import reviewsRoutes from "./reviews.js";
import postsRoutes from"./posts.js";
const constructorMethod = (app) => {
    app.use('/', parksRoutes);
    // app.use('/parks', parksRoutes);
    app.use('/reviews', reviewsRoutes);
    app.use('/auth', authRoutes);
    app.use('/posts', postsRoutes);


    app.use('*', (req, res) => {
        return res.status(404).render('error', {error: 'Not found'});
    });
};

export default constructorMethod;