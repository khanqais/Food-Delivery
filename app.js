//User-name=postgres
//Password=admin1234
require("dotenv").config();
const authMiddleware = require("./middleware/auth");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const connectDB = require("./DB/connect");
const path = require("path");
const cors = require("cors");
const authRouter = require("./routes/auth");
const passport=require('passport')
const session=require('express-session');
const { profile } = require("console");
const user = require("./model/user");
const { default: axios } = require("axios");
const Google=require("passport-google-oauth20").Strategy 

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser());
app.use(authMiddleware);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use("/", authRouter);
app.get("/", (req, res) => {
  res.render("index", { user: req.user, currentPage: "home" });
});



passport.use(
  new Google(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
       
        let existingUser = await user.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }
        
        
        let userByEmail = await user.findOne({ email: profile.emails[0].value });
        
        if (userByEmail) {
          
          userByEmail.googleId = profile.id;
          userByEmail.profilePicture = profile.photos[0].value;
          await userByEmail.save();
          return done(null, userByEmail);
        }

        
        const newUser = new user({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (err) {
        console.error("Google auth error:", err);
        return done(err, null);
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await user.findById(id);
    done(null, foundUser);
  } catch (err) {
    done(err, null);
  }
});


app.get('/restaurant', (req, res) => {
  res.render('restaurant', { currentPage: 'restaurant', user: req.user });
});

// setInterval(() => {
//   axios.get("https://food-delivery-4-sw7y.onrender.com");
// }, 1000 * 60 * 5);


const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to Mongo");
    app.listen(PORT, console.log(`Server is listening on ${PORT}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
