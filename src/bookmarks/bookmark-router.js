const express = require('express')
const { v4: uuid } = require('uuid')
const bookmarkRouter = express.Router()
const bodyParser = express.json()
const store = require('../store')
const bookmarks = store.bookmarks

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body
    if(!title){
        logger.error('title is rqrd')
        return res
            .status(400)
            .send('invalid title data')
    }

    if(!url){
        logger.error(`URL is rqrd`)
        return res
            .status(400)
            .send('invalid url data')
    }

    if(!description){
        logger.error('descr rqrd')
        return res
            .status(400)
            .send('invalid descr data')
    }

    if(!rating){
        logger.error('rating rqrd')
        return res
            .status(400)
            .send('invalid rating data')
    }

    const id = uuid()
    const bookmark = {
        id,
        title,
        url,
        description,
        rating
    }
    bookmarks.push(bookmark)
    res
        .status(201)
        .location(`http://localhost:8000/bookmarks/${id}`)
        .json({bookmark})
})

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params
        const bookmark = bookmarks.find(b => b.id == id);
      
        if (!bookmark) {
          logger.error(`bookmark with id ${id} not found.`);
          return res
            .status(404)
            .send('Bookmark Not Found');
        }
      
        res.json(bookmark);    
    })
    .delete((req, res) => {
        const { id } = req.params;
  
        const bookmarkIndex = bookmarks.findIndex(bi => bi.id == id);
      
        if (bookmarkIndex === -1) {
          logger.error(`Bookmark with id ${id} not found.`);
          return res
            .status(404)
            .send('Not Found');
        }
      
        bookmarks.splice(bookmarkIndex, 1);
      
        logger.info(`Bookmark with id ${id} deleted.`);
        res
          .status(204)
          .send(bookmarks)
          .end();    
    })


module.exports = { bookmarkRouter }
