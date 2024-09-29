var https = require('https');
var fs = require('fs');
const express = require("express");
const { google } = require("googleapis");

//伺服器程式
var options = {
    key: fs.readFileSync('./archive/server-key.pem'),
    ca: [fs.readFileSync('./archive/cert.pem')],
    cert: fs.readFileSync('./archive/server-cert.pem')
};

//路由
const generateRouter = require("./router/generate.js");
const saveRouter = require("./router/save.js");
const temporaryRouter = require("./router/temporary.js");
//const lineRotrouter =require("./router/linebot.js");

//基本設定
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));


//網站呈現view資料夾底下的ejs
app.get("/", (req, res) => {
	res.render("index");
});


//接收表單資料
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

   //google授權
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
  
  //如果有找到userid直接取代掉原本那行
  if (fet == true){
    var srange = "userinfo!A" + (sheetrow+1) + ":F" +(sheetrow+1);
    
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
   // 如果沒有找到userid，直接新增
  else{
   
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


  //跳轉回去index.ejs
  res.redirect("/");
  
});

https.createServer(options,app , function (req, res) {
    
}).listen(3443) ;

//路由
app.use("/generate", generateRouter);
app.use("/save",saveRouter);
app.use("/temporary",temporaryRouter);
//app.use("/linbot", lineRotrouter);

//app.listen(1337, (req, res) => console.log("running on 1337"));
module.exports = app;