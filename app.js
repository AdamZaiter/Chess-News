require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const app = express();

const port = process.env.PORT;

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

mongoose.connect("mongodb+srv://adam:" + process.env.PASSWORD + "@chessdb-fgiii.mongodb.net/chessDB", {
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
  date_posted: String,
  author: String,
  content: String,
  image_url: String
};

const commentSchema = {
  parent_article_id: String,
  content: String,
  author: String,
  date_posted: String
};

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Article = mongoose.model("Article", articleSchema);
const Comment = mongoose.model("Comment", commentSchema);

passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// const comment1 = new Comment({
//   parent_article_id: '5eb05d54fdb85901d7331c98',
//   content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
//   author: 'adam',
//   date_posted: '03-05-2020'

// });
// comment1.save();

// const comment2 = new Comment({
//   parent_article_id: '5eb05d54fdb85901d7331c98',
//   content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
//   author: 'adam',
//   date_posted: '03-05-2020'

// });
// comment2.save();


// const article1 = new Article({
//     title: "PHASELLUS ACCUMSAN",
//     date_posted: '22-04-2020',
//     author: 'adam',
//     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     image_url: "https://www.aoe.com/fileadmin/AOE.com/images/main_navigation/blog/Stock_Photos/miscellaneous/Fotolia_94900081_Chess_Pieces_930_590_70.jpg"
// });
// article1.save();

// const article2 = new Article({
//     title: "INTEGER BLANDIT",
//     date_posted: '22-04-2020',
//     author: 'adam',
//     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     image_url: "https://slatestarcodex.com/blog_images/chessgame2.gif"
// });
// article2.save();

// const article3 = new Article({
//     title: "AENEAN EROS ENIM",
//     date_posted: '22-04-2020',
//     author: 'adam',
//     content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
//     image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ7mxsrtiaitOZ8ZCiCHfs1dXvHaoWdY8K6mYpS8AfC9-u4CO6A&usqp=CAU"
// });
// article3.save();

var username = null;
app.route("/").get((req, res) => {
  let isLogged = req.isAuthenticated();
  if (isLogged) {
    username = req.user.username;
  }
  res.render("home", { isLogged: isLogged, username: username });
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
      username = req.user.username;
    }
    res.render('article', {isLogged: isLogged, username: username, articleId : req.params.articleId,
      title: article.title, text: article.content, image: article.image_url, date: article.date_posted, author: article.author})

  });
});

app.get('/articles/:articleId/comments', function(req, res) {
  Article.findOne({_id: req.params.articleId}, (err, article) => {
    let isLogged = req.isAuthenticated();
    if (isLogged) {
      username = req.user.username;
    }
    Comment.find({parent_article_id: req.params.articleId}, (err, comments) => {
      res.render('comments', {isLogged: isLogged, username: username, title: article.title, articleId: req.params.articleId,
        comments: comments})

    })

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
        let isLogged = req.isAuthenticated();
        if (isLogged) {
          username = req.user.username;
        }
        res.render('articles', {
          isLogged: isLogged,
          username: username,
          articles: articles,
          current: page,
          pages: Math.ceil(count / perPage)
        })
      })
    })
})

app.get('/chess', (req, res) => {
  if (req.isAuthenticated()) {
    username = req.user.username;
  }
  res.render('chess', {isLogged: req.isAuthenticated(), username: username});
});

app.listen(port, () => console.log("Server started on port 5000."));
