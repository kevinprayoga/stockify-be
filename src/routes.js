'use strict';

const { addUserHandler, getUserByIdHandler } = require('./user/handler');

const {
  addBusinessInfoHandler,
  getBusinessInfoByIdHandler,
  editBusinessInfoByIdHandler,
} = require('./business/handler');

const {
  addProductHandler,
  getAllProductHandler,
  getProductByIdHandler,
  editProductByIdHandler,
  deleteProductByIdHandler,
} = require('./product/handler');

const {
  addTransactionItemHandler,
  getTransactionItemUnOrderHandler,
  getTransactionItemByIdHandler,
  editTransactionItemByIdHandler,
} = require('./transactionItem/handler');

const {
  addTransactionHandler,
  getAllTransactionHandler,
  getTransactionByIdHandler,
} = require('./transaction/handler');

const routes = [
  {
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response({ message: 'Welcome to the API!' }).code(200);
    },
  },
  {
    method: 'POST',
    path: '/user',
    handler: addUserHandler,
  },
  {
    method: 'GET',
    path: '/user/{userID}',
    handler: getUserByIdHandler,
  },
  {
    method: 'POST',
    path: '/business',
    handler: addBusinessInfoHandler,
  },
  {
    method: 'GET',
    path: '/business/{userID}',
    handler: getBusinessInfoByIdHandler,
  },
  {
    method: 'PUT',
    path: '/business/{businessId}',
    handler: editBusinessInfoByIdHandler,
  },
  {
    method: 'POST',
    path: "/business/product",
    handler: addProductHandler,
  },
  {
    method: 'GET',
    path: '/business/{businessId}/product',
    handler: getAllProductHandler,
  },
  {
    method: 'GET',
    path: '/business/{businessId}/product/{productId}',
    handler: getProductByIdHandler,
  },
  {
    method: 'PUT',
    path: '/business/{businessId}/product/{productId}',
    handler: editProductByIdHandler,
  },
  {
    method: "DELETE",
    path: '/business/{businessId}/product/{productId}',
    handler: deleteProductByIdHandler,
  },
  {
    method: 'POST',
    path: "/business/transactionItem",
    handler: addTransactionItemHandler,
  },
  {
    method: 'GET',
    path: '/business/{businessId}/transactionItem',
    handler: getTransactionItemUnOrderHandler,
  },
  {
    method: 'GET',
    path: '/business/{businessId}/transactionItem/{transactionItemId}',
    handler: getTransactionItemByIdHandler,
  },
  {
    method: 'PUT',
    path: '/business/{businessId}/transactionItem/{transactionItemId}',
    handler: editTransactionItemByIdHandler,
  },
  {
    method: 'POST',
    path: "/business/transaction",
    handler: addTransactionHandler,
  },
  {
    method: 'GET',
    path: '/business/{businessId}/transaction',
    handler: getAllTransactionHandler,
  },
  {
    method: 'GET',
    path: '/business/{businessId}/transaction/{transactionId}',
    handler: getTransactionByIdHandler,
  },
];

module.exports = routes;
