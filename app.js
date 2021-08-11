const path = require("path");
const express = require("express");
const expressHbs = require("express-handlebars");
const sequelize = require("./util/database");
const Heroes = require("./models/Heroes");
const Races = require("./models/Races");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const errorController = require("./controllers/ErrorController");

const app = express();

const compareHelpers = require("./util/helpers/hbs/compare");

app.engine(
  "hbs",
  expressHbs({
    layoutsDir: "views/layouts/",
    defaultLayout: "main-layout",
    extname: "hbs",
    helpers: {
      equalValue: compareHelpers.EqualValue,
    },
  })
);

app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

app.use(multer({ storage: fileStorage }).single("ImagePath"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/images", express.static(path.join(__dirname, "images")));

const heroesRouter = require("./routes/heroes");
const racesRouter = require("./routes/races");

app.use(heroesRouter);
app.use(racesRouter);

app.use(errorController.Get404);

Heroes.belongsTo(Races, { constraint: true, onDelete: "CASCADE" });
Races.hasMany(Heroes);

sequelize
  .sync()
  .then((result) => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
