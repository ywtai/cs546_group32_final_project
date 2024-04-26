import parksRoutes from "./parks.js"
import authRoutes from './auth_routes.js';
import reviewsRoutes from "./reviews.js";

const constructorMethod = (app) => {
    app.use('/parks', parksRoutes);
    app.use('/reviews', reviewsRoutes);
    app.use('/auth', authRoutes);


    app.use('*', (req, res) => {
        return res.status(404).render('error', {error: 'Not found'});
    });
};

export default constructorMethod;