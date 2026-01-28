import Product from "../models/product.model.js";
import { throwHttpError } from "../utils/httpError.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Construir filtro
    let filter = {};
    if (query) {
      if (query.includes(":")) {
        const [field, value] = query.split(":");
        if (field && value) {
          if (value === "true" || value === "false") {
            filter[field] = value === "true";
          } else {
            filter[field] = value;
          }
        }
      } else {
        filter = {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        };
      }
    }

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      lean: true,
    };

    if (sort === "asc" || sort === "desc") {
      options.sort = { price: sort === "asc" ? 1 : -1 };
    }

    const productsData = await Product.paginate(filter, options);

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const queryParams = new URLSearchParams();

    if (limit) queryParams.set("limit", limit);
    if (query) queryParams.set("query", query);
    if (sort) queryParams.set("sort", sort);

    const queryString = queryParams.toString();

    const prevLink = productsData.hasPrevPage
      ? `${baseUrl}?${queryString ? queryString + "&" : ""}page=${productsData.prevPage}`
      : null;

    const nextLink = productsData.hasNextPage
      ? `${baseUrl}?${queryString ? queryString + "&" : ""}page=${productsData.nextPage}`
      : null;

    res.status(200).json({
      status: "success",
      payload: productsData.docs,
      totalPages: productsData.totalPages,
      prevPage: productsData.prevPage,
      nextPage: productsData.nextPage,
      page: productsData.page,
      hasPrevPage: productsData.hasPrevPage,
      hasNextPage: productsData.hasNextPage,
      prevLink: prevLink,
      nextLink: nextLink,
    });
  } catch (error) {
    next(error);
  }
};

export const addProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);

    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    next(error);
  }
};

export const setProductById = async (req, res, next) => {
  try {
    const pid = req.params.pid;
    const updateData = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(pid, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) throwHttpError("Producto no encontrado", 404);

    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    next(error);
  }
};

export const deleteProductById = async (req, res, next) => {
  try {
    const pid = req.params.pid;

    const deletedProduct = await Product.findByIdAndDelete(pid);
    if (!deletedProduct) throwHttpError("Producto no encontrado", 404);

    res.status(200).json({ status: "success", payload: deletedProduct });
  } catch (error) {
    next(error);
  }
};
