import parksRoutes from "./parks.js";
import reviewsRoutes from "./reviews.js";

const constructorMethod = (app) => {
    app.use('/parks', parksRoutes);
    app.use('/reviews', reviewsRoutes);

    app.use('*', (req, res) => {
        return res.status(404).render('error', {error: 'Not found'});
    });
};

export default constructorMethod;