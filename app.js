const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.route("/").get((req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(5000, () => console.log("Server started on port 5000."));
