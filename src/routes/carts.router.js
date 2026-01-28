import express from "express";
import Cart from "../models/cart.model.js";
import { throwHttpError } from "../utils/httpError.js";

const cartRouter = express.Router();

cartRouter.post("/", async (req, res, next) => {
  try {
    const cart = await Cart.create({});
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/:cid/product/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    //Verificar que el producto exista (importo el modelo de product y verifico con pid si existe)
    //Verificar que el carrito exista
    //Verificar si el producto existe en el carrito
    //Si existe, incrementar la cantidad
    //sino, agregarlo como nuevo
    const updatedCart = await Cart.findByIdAndUpdate(
      cid,
      { $push: { products: { product: pid, quantity } } },
      { new: true, runValidators: true },
    );
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    next(error);
  }
});

cartRouter.get("/:cid", async (req, res, next) => {
  try {
    const cid = req.params.cid;
    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart) throwHttpError("Carrito no encontrado", 404);

    res.status(200).json({ status: "success", payload: cart.products });
  } catch (error) {
    next(error);
  }
});

// Eliminar producto específico del carrito
cartRouter.delete("/:cid/products/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const cart = await Cart.findById(cid);

    if (!cart) throwHttpError("Carrito no encontrado", 404);

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== pid,
    );

    await cart.save();
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    next(error);
  }
});

// Actualizar todo el carrito
cartRouter.put("/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products },
      { new: true, runValidators: true },
    ).populate("products.product");

    if (!cart) throwHttpError("Carrito no encontrado", 404);

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    next(error);
  }
});

// Actualizar cantidad de un producto
cartRouter.put("/:cid/products/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findById(cid);
    if (!cart) throwHttpError("Carrito no encontrado", 404);

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid,
    );

    if (productIndex === -1)
      throwHttpError("Producto no encontrado en el carrito", 404);

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    next(error);
  }
});

// Vaciar carrito
cartRouter.delete("/:cid", async (req, res, next) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true },
    );

    if (!cart) throwHttpError("Carrito no encontrado", 404);

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    next(error);
  }
});

export default cartRouter;
