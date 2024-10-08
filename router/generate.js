const express = require("express");
const { google } = require("googleapis");
//路由
const router = express.Router();
const app = express();

//基本設定
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//網站呈現view資料夾底下的ejs
router.get("/", (req, res) => {
	res.render("generate");
  
});

//獲取表單資料
router.post("/", async (req, res) => {
  
  var { 料理, 一天預算, 其他描述, userId} = req.body;
  
  
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
  
  //如果有找到userid直接取代掉原本那行
  if (fet == true){
    var srange = "userinfo!B" + (sheetrow+1) + ":K" +(sheetrow+1);
    //直接取代掉原本那行
    //覆蓋資料時，sheetrow還要再加一
    await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: srange,
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[userId, , , , , 料理, 一天預算, 其他描述]],
      },
    });



  }
   // 如果沒有找到userid，直接新增
  else{
    // Write row(s) to spreadsheet
    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "userinfo!E:I",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [[ , userId, , , , ,料理, 一天預算, 其他描述]],
      },
    });
  }

  
  
  
  
  //跳轉回到表單
  res.redirect("/generate");
  
});

module.exports = router;