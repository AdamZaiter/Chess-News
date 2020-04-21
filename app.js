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

const articleSchema = {
      title: String,
      content: String,
      image_url: String
};

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// const article1 = new Article({
//     title: "PHASELLUS ACCUMSAN",
//     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     image_url: "https://www.aoe.com/fileadmin/AOE.com/images/main_navigation/blog/Stock_Photos/miscellaneous/Fotolia_94900081_Chess_Pieces_930_590_70.jpg"
// });
// article1.save();

// const article2 = new Article({
//     title: "INTEGER BLANDIT",
//     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     image_url: "https://slatestarcodex.com/blog_images/chessgame2.gif"
// });
// article2.save();

// const article3 = new Article({
//     title: "AENEAN EROS ENIM",
//     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ7mxsrtiaitOZ8ZCiCHfs1dXvHaoWdY8K6mYpS8AfC9-u4CO6A&usqp=CAU"
// });
// article3.save();

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
        res.render("home", { isLogged: isLogged, username: req.user.username });
    } else {
      res.render("login", { isLogged: isLogged });
    }
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });

      User.findOne({username: req.body.username}, function (err, user) {
        if (user) {
            req.login(user, (err) => {
              if (err) {
                console.log(err);
              } else {
                passport.authenticate("local")(req, res, () => {
                  res.redirect("/");
                });
              }
        });
        } else {
            res.redirect("/login");

    }
  });
  });

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

app
  .route("/register")
  .get((req, res) => {
  if (req.isAuthenticated()) {
      res.redirect("/"); 
  } else {
      res.render("register", {isLogged: false})

  }
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

app.get('/articles', (req, res) => {
    res.redirect('/articles/page/1')  
});

app.get('/articles/:articleId', function(req, res) {
   Article.findOne({_id: req.params.articleId}, (err, article) => {
       let isLogged = req.isAuthenticated();
       if (isLogged) {
           res.render('article', {isLogged: isLogged, username: req.user.username, title: article.title, text: article.content, image: article.image_url})
       } else {
           res.render('article', {isLogged: false, title: article.title, text: article.content, image: article.image_url})
       }

  });
});

app.get('/articles/page/:page', function(req, res, next) {
    var perPage = 5
    var page = req.params.page || 1

    Article
        .find({})
        .skip((perPage * page) - perPage)
        .limit(perPage)
        .exec(function(err, articles) {
            Article.count().exec(function(err, count) {
                if (err) return next(err)
                res.render('articles', {
                    isLogged: false,
                    articles: articles,
                    current: page,
                    pages: Math.ceil(count / perPage)
                })
            })
        })
})

app.listen(5000, () => console.log("Server started on port 5000."));
