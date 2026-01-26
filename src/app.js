import express from "express";
import { engine } from "express-handlebars";
import productsRouter from "./routes/products.router.js";
import http from "http";
import viewsRouter from "./routes/views.router.js";
import cartRouter from "./routes/cart.router.js";
import { Server } from "socket.io";
import ProductManager from "./productManager.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import __dirname from "../dirname.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//incializamos las variables de entorno
dotenv.config({ path: __dirname + "/.env" });
app.use(express.static(__dirname + "/public"));
const PORT = process.env.PORT || 8081;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://User:<UserPassword>@store26.saehlue.mongodb.net/myEcommerce?appName=Store26",
    );
  } catch (error) {}
};

connectMongoDB();

//habilitamos la carpeta public para archivos estaticos
app.use(express.static("public"));
//habilitamos poder recibir data desde formularios
app.use(express.urlencoded({ extended: true }));

//handlebars config
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");
app.set("views", __dirname + "/src/views");

//endpoints
app.use("/api/carts", cartRouter);
app.use("/api/products", productsRouter);
app.use("/", viewsRouter);

//websocket
const pm = new ProductManager("./src/data/products.json");
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  socket.on("newProduct", async (productData) => {
    try {
      const newProduct = await pm.addProduct(productData);
      io.emit("productAdded", newProduct);
      console.log("Producto agregado y notificado a los clientes", productData);
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  });

  socket.on("deleteProduct", async (data) => {
    try {
      const { id } = data;
      const idAsString = String(id); //fuerza a string
      console.log(
        "Recibido deleteProduct con ID:",
        idAsString,
        typeof idAsString,
      );
      await pm.deleteProductById(idAsString);
      io.emit("productDeleted", idAsString);
      console.log("Producto eliminado:", idAsString);
    } catch (error) {
      console.error("Error al eliminar:", error.message);
    }
  });
});

app.use(errorHandler);

server.listen(PORT, () => {
  console.log("Servidor corriendo");
});
