import express from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import {throwHttpError} from "../utils/httpError.js";

const cartsRouter = express.Router();

cartsRouter.post("/", async (req, res, next) => {
  try {
    const cart = await Cart.create({});
    res.status(201).json({status: "success", payload: cart});
  } catch (error) {
    next(error);
  }
});

cartsRouter.post("/:cid/product/:pid", async (req, res, next) => {
  try {
    const {cid, pid} = req.params;
    const {quantity = 1} = req.body;

    // Verificar que el producto exista
    const product = await Product.findById(pid);
    if (!product) throwHttpError("Producto no encontrado", 404);

    // Verificar que el carrito exista
    const cart = await Cart.findById(cid);
    if (!cart) throwHttpError("Carrito no encontrado", 404);

    // Verificar si el producto ya existe en el carrito
    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid,
    );

    if (existingProductIndex !== -1) {
      // Si existe, incrementar la cantidad
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      // Si no existe, agregarlo como nuevo
      cart.products.push({product: pid, quantity});
    }

    await cart.save();
    await cart.populate("products.product");

    res.status(200).json({status: "success", payload: cart});
  } catch (error) {
    next(error);
  }
});

cartsRouter.get("/:cid", async (req, res, next) => {
  try {
    const cid = req.params.cid;
    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart) throwHttpError("Carrito no encontrado", 404);

    res.status(200).json({status: "success", payload: cart.products});
  } catch (error) {
    next(error);
  }
});

cartsRouter.delete("/:cid/products/:pid", async (req, res, next) => {
  try {
    const {cid, pid} = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) throwHttpError("Carrito no encontrado", 404);

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid,
    );

    await cart.save();
    res.status(200).json({status: "success", payload: cart});
  } catch (error) {
    next(error);
  }
});

cartsRouter.put("/:cid", async (req, res, next) => {
  try {
    const {cid} = req.params;
    const {products} = req.body;

    const cart = await Cart.findByIdAndUpdate(
      cid,
      {products},
      {new: true, runValidators: true},
    ).populate("products.product");

    if (!cart) throwHttpError("Carrito no encontrado", 404);

    res.status(200).json({status: "success", payload: cart});
  } catch (error) {
    next(error);
  }
});

cartsRouter.put("/:cid/products/:pid", async (req, res, next) => {
  try {
    const {cid, pid} = req.params;
    const {quantity} = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) throwHttpError("Carrito no encontrado", 404);

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid,
    );

    if (productIndex === -1)
      throwHttpError("Producto no encontrado en el carrito", 404);

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({status: "success", payload: cart});
  } catch (error) {
    next(error);
  }
});

cartsRouter.delete("/:cid", async (req, res, next) => {
  try {
    const {cid} = req.params;

    const cart = await Cart.findByIdAndUpdate(cid, {products: []}, {new: true});

    if (!cart) throwHttpError("Carrito no encontrado", 404);

    res.status(200).json({status: "success", payload: cart});
  } catch (error) {
    next(error);
  }
});

export default cartsRouter;
