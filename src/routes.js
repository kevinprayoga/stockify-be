"use strict";

const {
  addBusinessInfoHandler,
  getBusinessInfoHandler,
  updateBusinessInfoHandler,
} = require("./business/handler");

const {
  addProductHandler,
  getAllProductHandler,
  getProductByIdHandler,
  editProductByIdHandler,
  deleteProductByIdHandler,
} = require("./product/handler");

const routes = [
  {
    method: "POST",
    path: "/business",
    handler: addBusinessInfoHandler,
  },
  {
    method: "GET",
    path: "/business/{businessId}",
    handler: getBusinessInfoHandler,
  },
  {
    method: "PUT",
    path: "/business/{businessId}",
    handler: updateBusinessInfoHandler,
  },
  {
    method: "POST",
    path: "/business/product",
    handler: addProductHandler,
  },
  {
    method: "GET",
    path: "/business/product",
    handler: getAllProductHandler,
  },
  {
    method: "GET",
    path: "/business/product/{productId}",
    handler: getProductByIdHandler,
  },
  {
    method: "PUT",
    path: "/business/product/{productId}",
    handler: editProductByIdHandler,
  },
  {
    method: "DELETE",
    path: "/business/product/{productId}",
    handler: deleteProductByIdHandler,
  },

];

module.exports = routes;
