const bookmarkRouter = express.Router()
const store = require('../store')

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(store.bookmarks)
    })