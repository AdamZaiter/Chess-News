require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/chessDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.route("/").get((req, res) => {
  if (req.isAuthenticated()) {
    let isLogged = req.isAuthenticated();
    res.render("home", { isLogged: isLogged, username: req.user.username });
  } else {
    res.render("home", { isLogged: false });
  }
});

app
  .route("/login")
  .get((req, res) => {
    var isLogged = req.isAuthenticated();
    if (req.isAuthenticated()) {
      res.render("home", { isLogged: isLogged });
    } else {
      res.render("login", { isLogged: isLogged });
    }
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/");
        });
      }
    });
  });

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app
  .route("/register")
  .get((req, res) => {
    let isLogged = req.isAuthenticated();
    res.render("register", { isLogged: isLogged });
  })

  .post((req, res) => {
    User.register(
      { username: req.body.username, email: req.body.email },
      req.body.password,
      (err, user) => {
        if (err) {
          console.log(err);
          res.redirect("/register");
        } else {
          passport.authenticate("local")(req, res, () => {
            res.redirect("/");
          });
        }
      }
    );
  });

app.listen(5000, () => console.log("Server started on port 5000."));
