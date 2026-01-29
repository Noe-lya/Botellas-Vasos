// viewsRouter.js - versión corregida
import express from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const viewsRouter = express.Router();

viewsRouter.get("/", async (req, res, next) => {
  try {
    const {limit = 10, page = 1} = req.query;

    const productsData = await Product.paginate({}, {limit, page, lean: true});
    const products = productsData.docs;
    delete productsData.docs;

    const links = [];
    for (let index = 1; index <= productsData.totalPages; index++) {
      links.push({text: index, link: `?limit=${limit}&page=${index}`});
    }

    res.render("home", {products, links});
  } catch (error) {
    next(error);
  }
});

viewsRouter.get("/admin", async (req, res, next) => {
  try {
    const products = await Product.find({}).lean();
    res.render("admin", {products});
  } catch (error) {
    next(error);
  }
});

viewsRouter.get("/products", async (req, res, next) => {
  try {
    const {limit = 10, page = 1} = req.query;

    const productsData = await Product.paginate({}, {limit, page, lean: true});
    const products = productsData.docs;
    const {totalPages, hasPrevPage, hasNextPage, prevPage, nextPage} =
      productsData;
    delete productsData.docs;

    const links = [];
    for (let index = 1; index <= totalPages; index++) {
      links.push({
        text: index,
        link: `/products?limit=${limit}&page=${index}`,
      });
    }

    res.render("home", {
      products,
      links,
      pagination: {
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        currentPage: parseInt(page),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Solo una ruta para detalle de producto
viewsRouter.get("/products/:pid", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).render("404");
    }
    res.render("product.Details", {product});
  } catch (error) {
    next(error);
  }
});

// Solo una ruta para carrito
viewsRouter.get("/carts/:cid", async (req, res, next) => {
  console.log("Accediendo al carrito:", req.params.cid); // ← log temporal
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      console.log("Carrito no encontrado");
      return res.status(404).render("404");
    }

    console.log("Carrito encontrado, renderizando...");
    res.render("cart", {cart});
  } catch (error) {
    console.error("Error en /carts/:cid:", error);
    next(error);
  }
});

export default viewsRouter;
