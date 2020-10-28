require('dotenv').config()
const express = require('express')
const winston = require('winston')
const morgan = require('morgan')
const cors = require('cors')
const { v4:uuid } = require('uuid')
const helmet = require('helmet')
const store = require('./store')
const { NODE_ENV } = require('./config')
const app = express()
const morganOption = (NODE_ENV === 'production' ? 'tiny' : 'common')
app.use(express.json())
app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`)
      return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middleware
    next()
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'info.log' })
    ]
  });
  
  if (NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
}

const bookmarks = store.bookmarks

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.get('/bookmarks', (req, res) => {
    res
        .status(200)
        .json(bookmarks)
})

app.get('/bookmarks/:id', (req, res) => {
    const { id } = req.params
    const bookmark = bookmarks.find(b => b.id == id);
  
    if (!bookmark) {
      logger.error(`bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Bookmark Not Found');
    }
  
    res.json(bookmark);
});

app.post('/bookmarks', (req, res) => {
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

app.delete('/bookmarks/:id', (req, res) => {
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
  });

app.use(function errorHandler(e, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: {message: 'server error'}}
    } else {
        console.error(error)
        response = {message: error.message, error}
    }
    res.status(500).json(response)
})

module.exports = app