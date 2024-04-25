function logRequests(req, res, next) {
    const userStatus = req.session && req.session.user ? 'Authenticated User' : 'Non-Authenticated User';
    console.log(`[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${userStatus})`);
    next();
}


function redirectBasedOnRole(req, res, next) {
    if(req.session.user){
 
        return res.redirect('/user')

      }else{
        res.redirect('/login');
      }
}

function ensureLoggedIn(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

function ensureAdmin(req, res, next) {
    if(!req.session.user){
        res.redirect('/login')
      } else if(req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
          title: "Error",
          message: "Only admin have permission to view this page"
        })
      }
}

export { logRequests, redirectBasedOnRole, ensureLoggedIn, ensureAdmin };
