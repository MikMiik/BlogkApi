// InitImport
require("module-alias/register");
require("dotenv").config();
// require("@/configs/env.js");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;
const { sequelize } = require("@/models");
const { domain } = require("@/configs");

// RouterImport
const router = require("@/routes/api/index");

// MethodOverideImport
const methodOverride = require("method-override");

// CookieImport
const cookieParser = require("cookie-parser");

// LayoutImport
const expressLayouts = require("express-ejs-layouts");

//MiddlewareImport
const notFoundHandler = require("@/middlewares/notFoundHandler");
const errorHandler = require("@/middlewares/errorHandler");
const responseEnhancer = require("@/middlewares/responseEnhancer");
const handlePagination = require("@/middlewares/handlePagination");
const checkAuth = require("@/middlewares/checkAuth");

/*------------------------------------------------------------ */

// Middleware
app.use(
  cors({
    origin: [domain.CLIENT_URL, "http://localhost:5173/"],
    credentials: true,
  })
);
app.set("trust proxy", true);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(responseEnhancer);
app.use(handlePagination);

// ViewEngine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.set("layout", "./layouts/default");

// Router
app.use("/api/v1", checkAuth, router);

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
