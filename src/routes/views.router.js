import express from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const viewsRouter = express.Router();

viewsRouter.get("/", async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const productsData = await Product.paginate(
      {},
      { limit, page, lean: true },
    );
    const products = productsData.docs;
    delete productsData.docs;

    const links = [];

    for (let index = 1; index <= productsData.totalPages; index++) {
      links.push({ text: index, link: `?limit=${limit}&page=${index}` });
    }

    res.render("home", { products, links });
  } catch (error) {
    next(error);
  }
});

viewsRouter.get("/realTimeProducts", async (req, res, next) => {
  try {
    const products = await Product.find({}).lean();
    res.render("realTimeProducts", { products });
  } catch (error) {
    next(error);
  }
});

// Detalle de producto
viewsRouter.get("/products/:pid", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) {
      return res.status(404).render("404");
    }
    res.render("productDetail", { product });
  } catch (error) {
    next(error);
  }
});

// Vista de carrito específico
viewsRouter.get("/carts/:cid", async (req, res, next) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).render("404");
    }

    res.render("cart", { cart });
  } catch (error) {
    next(error);
  }
});

export default viewsRouter;
