import parksRoutes from "./parks.js"
import authRoutes from './auth_routes.js';


const constructorMethod = (app) => {
    app.use('/', parksRoutes);
    app.use('/auth', authRoutes);

    app.use('*', (req, res) => {
        return res.status(404).render('error', {error: 'Not found'});
    });
};

export default constructorMethod;