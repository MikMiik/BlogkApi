// InitImport
require("module-alias/register");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const { sequelize } = require("@/models");

// RouterImport
const router = require("@/routes/api/index");

// MethodOverideImport
const methodOverride = require("method-override");

// CookieImport
const cookieParser = require("cookie-parser");

//MiddlewareImport
const notFoundHandler = require("@/middlewares/notFoundHandler");
const errorHandler = require("@/middlewares/errorHandler");
const responseEnhancer = require("@/middlewares/responseEnhancer");

/*------------------------------------------------------------ */

// Middleware
app.use(cors({ origin: "http://blogk.online/", credentials: true }));
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(responseEnhancer);

// Router
app.use("/api/v1", router);

// ErrorHandle
app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

app.listen(port, () => {
  console.log(`http://localhost:${port}/api/v1`);
});
