const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

router.get("/", (req, res) => {
	res.render("recipe");
  
});

router.post("/", async (req, res) => {
  
  
  
});

module.exports = router;