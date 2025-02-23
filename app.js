require('dotenv').config();
const authMiddleware = require('./middleware/auth');
const express = require('express')
const app = express()
const port = 3000
const cookieParser = require('cookie-parser');
const connectDB = require('./DB/connect');
const path=require('path')
const cors = require('cors');
const authRouter=require('./routes/auth')

app.use(cookieParser());
app.use(authMiddleware); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));
app.use('/', authRouter)
app.get('/', (req, res) => {
  res.render('index', { user: req.user, currentPage: 'home' });
});


const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('Connected to Mongo');
    app.listen(PORT, console.log(`Server is listening on ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

start();