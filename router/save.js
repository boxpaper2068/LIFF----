const express = require("express");
const { google } = require("googleapis");
const router = express.Router();
const app = express();



app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

router.get("/", (req, res) => {
	res.render("save");
  res.json("123");
  
});

router.post("/", async (req, res) => {

  
  
  

});


router.post("/userdata", async (req, res) => {
  
  var userId= "";
  /*
  fetch('https://charves.ddns.net/save')
  .then(Response => Response.json())
  .then(data => userId)
  */
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  const spreadsheetId = "1j2VqS8AlFpdJkcRMgk5E5tT39W9kNIv-zGNJmbOl2AM";

  // Get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: "breakfast1!A:F",
  });

  
  /*
  //for迴圈判斷userid
  var fet = false;
  var sheetrow = 1 ;
  for (i=1 ; i<getRows.data.values.length ; i++){
      if(getRows.data.values[i][1] == userId){
        fet = true;
        sheetrow = i ;
        break;
    }
  }
  
  userdata = getRows.data.values[i];
  */
  res.json(getRows.data.values[1]);
  

  
});

module.exports = router;