import parksRoutes from "./parks.js"

const constructorMethod = (app) => {
    app.use('/', parksRoutes);

    app.use('*', (req, res) => {
        return res.status(404).render('error', {error: 'Not found'});
    });
};

export default constructorMethod;