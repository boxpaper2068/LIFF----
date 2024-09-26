/*
var https = require('https');
var fs = require('fs');
*/
const express = require("express");
const { google } = require("googleapis");

/*
var options = {
    key: fs.readFileSync('./archive/server-key.pem'),
    ca: [fs.readFileSync('./archive/cert.pem')],
    cert: fs.readFileSync('./archive/server-cert.pem')
};
*/

//路由
const generateRouter = require("./router/generate.js");
const saveRouter = require("./router/save.js");
const bf1Router = require("./router/breakfast1.js");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
	res.render("index");
});



app.post("/", async (req, res) => {
  //從html回傳資料
  var { userId, 飲食習慣, 體重, 工作量} = req.body;
  
  var 時間戳記 = new Date().toLocaleString();
  
  var 一日卡洛里建議 = 0;

  if(工作量=="輕度工作"){
    一日卡洛里建議 = 35 * 體重
  }
  else if(工作量=="中度工作"){
    一日卡洛里建議 = 40 * 體重
  }
  else{
    一日卡洛里建議 = 45 * 體重
  }

   
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
    range: "userinfo!A:F",
  });

  

  //for迴圈判斷userid在哪行
  var fet = false;
  var sheetrow = 1 ;
  for (i=1 ; i<getRows.data.values.length ; i++){
      if(getRows.data.values[i][1] == userId){
        fet = true;
        sheetrow = i ;
        break;
    }
  }
  

  if (fet == true){
    var srange = "userinfo!A" + (sheetrow+1) + ":F" +(sheetrow+1);
    //直接取代掉原本那行
    //覆蓋資料時，sheetrow還要再加一
    await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: srange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[時間戳記,userId,飲食習慣, 體重, 工作量,一日卡洛里建議]],
      },
    });
    
  }
  else{
    // Write row(s) to spreadsheet
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "userinfo!A:F",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[時間戳記,userId,飲食習慣, 體重, 工作量,一日卡洛里建議]],
      },
    });
  }


  //跳轉回去
  res.redirect("/");
  
});

app.listen(1337, (req, res) => console.log("running on 1337"));

//路由
app.use("/generate", generateRouter);
app.use("/save",saveRouter);
app.use("/breakfast1",bf1Router);

//app.listen(1337, (req, res) => console.log("running on 1337"));
module.exports = app;