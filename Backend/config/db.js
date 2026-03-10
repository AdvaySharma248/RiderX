const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const MONGO_DB = {
  production: { url: process.env.MONGODB_PROD_URL, type: "Atlas" },
  development: { url: process.env.MONGODB_DEV_URL, type: "Compass" },
};

const environment = process.env.ENVIRONMENT || "development";
const dbConfig = MONGO_DB[environment] || MONGO_DB.development;
const dbUrl = dbConfig?.url;

if (dbUrl) {
  mongoose
    .connect(dbUrl)
    .then(() => {
      if (environment !== "production") {
        console.log("Connected to Mongo DB", dbConfig.type);
      }
    })
    .catch((error) => {
      if (environment !== "production") {
        console.log("Failed to connect to MongoDB", error.message);
      }
    });
} else if (environment !== "production") {
  console.log(
    `MongoDB URL not configured for ${environment}. Set ${
      environment === "production" ? "MONGODB_PROD_URL" : "MONGODB_DEV_URL"
    } in Backend/.env`
  );
}

module.exports = mongoose.connection;
