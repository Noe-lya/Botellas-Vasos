import express from "express";
import productsRouter from "./routes/products.router.js";
import connectMongoDB from "./config/db.js";
import dotenv from "dotenv";
import __dirname from "../dirname.js";
import {errorHandler} from "./middlewares/error.middleware.js";
import cartsRouter from "./routes/carts.router.js";
import {engine} from "express-handlebars";
import Handlebars from "handlebars";
import viewsRouter from "./routes/views.router.js";

//incializamos las variables de entorno
dotenv.config({path: __dirname + "/.env"});

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));
const PORT = process.env.PORT || 8081;

connectMongoDB();

//handlebars config
app.engine("handlebars", engine({handlebars: Handlebars}));
app.set("view engine", "handlebars");
app.set("views", __dirname + "/src/views");

//handlebars helper
Handlebars.registerHelper("multiply", function (a, b) {
  return a * b;
});

Handlebars.registerHelper("calculateTotal", function (products) {
  return products.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
});

//endpoints
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Servidor iniciado correctamente!");
});
