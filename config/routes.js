module.exports = function (app) {
    var netflixCatalogController = require('../app/controllers/netflix/CatalogController')
    app.post('/catalog', netflixCatalogController.add);
    app.post('/catalog/addOrUpdate', netflixCatalogController.addOrUpdate);
    app.get('/catalog/deleted', netflixCatalogController.deleted);
    app.get('/', netflixCatalogController.index);
    app.get('/catalog/', netflixCatalogController.index);
    app.post('/catalog/search', netflixCatalogController.search);
    app.get('/catalog/details', netflixCatalogController.details);
    app.get('/catalog/get', netflixCatalogController.get);

    var netflixStatController = require('../app/controllers/netflix/StatController')
    app.post('/stat/generate', netflixStatController.generate);
    app.get('/stat/get', netflixStatController.get);

    var netflixTagController = require('../app/controllers/netflix/TagController')
    app.get('/tag/get', netflixTagController.get);

    /*app.post('/netflix/catalog', netflixCatalogController.add);
    app.post('/netflix/catalog/addOrUpdate', netflixCatalogController.addOrUpdate);
    app.get('/netflix/catalog/deleted', netflixCatalogController.deleted);
    app.get('/', netflixCatalogController.index);
    app.get('/netflix/catalog/', netflixCatalogController.index);
    app.post('/netflix/catalog/search', netflixCatalogController.search);
    app.get('/netflix/catalog/details', netflixCatalogController.details);
    app.get('/netflix/catalog/get', netflixCatalogController.get);

    var netflixStatController = require('../app/controllers/netflix/StatController')
    app.post('/netflix/stat/generate', netflixStatController.generate);
    app.get('/netflix/stat/get', netflixStatController.get);

    var netflixTagController = require('../app/controllers/netflix/TagController')
    app.get('/netflix/tag/get', netflixTagController.get);*/

    var userCommentController = require('../app/controllers/user/CommentController')
    app.get('/feedback', userCommentController.index);
    app.post('/feedback/add', userCommentController.add);
    app.get('/feedback/list', userCommentController.list);

    var staticPagesController = require('../app/controllers/static/PagesController')
    app.get('/about', staticPagesController.about);
    app.get('/faq', staticPagesController.faq);

    app.use(function(req, res, next){
        res.render('404.jade', {title: "404 - Page Not Found", status: 404, url: req.url });
    });
}