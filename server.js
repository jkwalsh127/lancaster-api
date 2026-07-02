require('dotenv-safe').config({ allowEmptyValues: true })
const environment = require('./config/environment');
const express = require('express')
const bodyParser = require('body-parser')
// const morgan = require('morgan')
const compression = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const passport = require('passport')
const app = express()
const initMongo = require('./config/mongo')
const path = require('path')
const evm = require('./cron-service/evm.cjs');
const CronRouter = require('./cron-service/router.cjs');

// Setup express server port from ENV, default: 3000
app.set('port', environment.PORT || 3000)

// // Initialize the EVM. Ensure you initialize in your main server file.
// evm.__init__();

// // Enable only in development HTTP request logger middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'))
// }

// for parsing json
app.use(
  bodyParser.json({
    limit: '20mb'
  })
)
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: '20mb',
    extended: true
  })
)

// Init all other stuff
app.use(cors())
app.use(passport.initialize())
app.use(compression())
app.use(helmet())
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
app.use('/cron', CronRouter)
app.use('/', require('./app/routes'))
app.listen(app.get('port'))

// Init MongoDB
initMongo()

module.exports = app // for testing
