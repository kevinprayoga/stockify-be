"use strict";

const { nanoid } = require("nanoid");
const { Timestamp, FieldValue, Filter } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const { db } = require("../../config/firebaseConfig");

/** Untuk bisa search per huruf */
const generateNgrams = (text) => {
  const ngrams = [];
  for (let i = 1; i <= text.length; i++) {
    ngrams.push(text.substring(0, i).toLowerCase());
  }
  return ngrams;
};

const addProductHandler = async (request, h) => {
  let productId = nanoid(20);
  const {
    businessId,
    productName,
    cost,
    price,
    stock,
    image,
  } = request.payload;

  // Validasi payload
  if (!businessId || !productName || !cost || !price || !stock || !image) {
    const response = h.response({
      status: "failed",
      message: "Gagal menambahkan data produk. Mohon isi field produk Anda dengan lengkap",
    });
    response.code(400);
    return response;
  }
  
  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;
  
  const ngrams = generateNgrams(productName);

  try {
    // Memeriksa apakah dokumen dengan ID yang dihasilkan sudah ada
    while ((await db.collection('businessInfo').doc(businessId)
      .collection('product').doc(productId).get()).exists) {
      transactionItemId = nanoid(20);
    }

    /** Memeriksa apakah produk sudah ada */
    const querySnapshot = await db.collection('businessInfo').doc(businessId).collection('product').where('productName', '==', productName).get();
    if (!querySnapshot.empty) {
      const response = h.response({
        status: 'failed',
        message: 'Produk sudah ada',
      });
      response.code(400);
      return response;
    }

    const newProduct = {
      productId,
      businessId,
      productName,
      cost,
      price,
      stock,
      image,
      createdAt,
      updatedAt,
      ngrams,
    };

    /** Proses menambahkan ke database */
    const productRef = db.collection('businessInfo').doc(businessId)
    .collection('product').doc(productId);
    await productRef.set(newProduct);

    const isSuccess = await productRef.get();

    if (!isSuccess.exists) {
      const response = h.response({
        status: "failed",
        message: "Produk gagal ditambahkan",
      });
      response.code(500);
      return response;
    }

    const response = h.response({
      status: "success",
      message: "Produk berhasil ditambahkan",
      data: {
        productId,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error("Error adding product: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal menambahkan produk",
    });
    response.code(500);
    return response;
  }
};

const getAllProductHandler = async (request, h) => {
  const { queryName } = request.query;
  const { businessId } = request.params;

  const productRef = db
    .collection("businessInfo")
    .doc(businessId)
    .collection("product");

  try {
    let products;
    /** Jika tidak ada queryName */
    if (!queryName) {
      const productGet = await productRef.orderBy("createdAt", "desc").get();
      products = productGet.docs.map((doc) => {
        const data = doc.data();
        return {
          productId: data.productId,
          businessId: data.businessId,
          productName: data.productName,
          cost: data.cost,
          price: data.price,
          stock: data.stock,
          image: data.image,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      const response = h.response({
        status: "success",
        data: products,
      });
      response.code(200);
      return response;
    }

    /** Jika ada queryName */
    const filteredProduct = await productRef
      .where("ngrams", "array-contains", queryName.toLowerCase())
      .get();
    products = filteredProduct.docs.map((doc) => {
      const data = doc.data();
      return {
        productId: data.productId,
        businessId: data.businessId,
        productName: data.productName,
        cost: data.cost,
        price: data.price,
        stock: data.stock,
        image: data.image,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    const response = h.response({
      status: "success",
      data: products,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error getting all product: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal mendapatkan produk",
    });
    response.code(500);
    return response;
  }
};

const getProductByIdHandler = async (request, h) => {
  const { businessId, productId } = request.params;

  try {
    const productRef = db
      .collection("businessInfo")
      .doc(businessId)
      .collection("product")
      .doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      const response = h.response({
        status: "failed",
        message: "Produk tidak ditemukan",
      });
      response.code(404);
      return response;
    }

    // Ekstrak data yang relevan
    const data = doc.data();
    const responseData = {
      productId: data.productId,
      businessId: data.businessId,
      productName: data.productName,
      cost: data.cost,
      price: data.price,
      stock: data.stock,
      image: data.image,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    const response = h.response({
      status: "success",
      data: responseData,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error getting product by id: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal mendapatkan produk",
    });
    response.code(500);
    return response;
  }
};

const editProductByIdHandler = async (request, h) => {
  const { businessId, productId } = request.params;
  const { productName, cost, price, stock, image } = request.payload;

  const updatedAt = new Date().toISOString();

  try {
    const productRef = db
      .collection("businessInfo")
      .doc(businessId)
      .collection("product")
      .doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      const response = h.response({
        status: "failed",
        message: "Produk tidak ditemukan",
      });
      response.code(404);
      return response;
    }

    const updatedProduct = { updatedAt }; // Selalu perbarui updatedAt

    // Hanya tambahkan atribut ke updatedProduct jika ada di payload
    if (productName) {
      updatedProduct.productName = productName;
      updatedProduct.ngrams = generateNgrams(productName);
    }
    if (cost) updatedProduct.cost = cost;
    if (price) updatedProduct.price = price;
    if (stock) updatedProduct.stock = stock;
    if (image) updatedProduct.image = image;

    await productRef.update(updatedProduct);

    const response = h.response({
      status: "success",
      message: "Produk berhasil diperbarui",
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error updating product: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal memperbarui produk",
    });
    response.code(500);
    return response;
  }
};

const deleteProductByIdHandler = async (request, h) => {
  const { businessId, productId } = request.params;

  try {
    const productRef = db
      .collection("businessInfo")
      .doc(businessId)
      .collection("product")
      .doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      const response = h.response({
        status: "failed",
        message: "Produk tidak ditemukan",
      });
      response.code(404);
      return response;
    }

    await productRef.delete();

    const response = h.response({
      status: "success",
      message: "Produk berhasil dihapus",
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error deleting product: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal menghapus produk",
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addProductHandler,
  getAllProductHandler,
  getProductByIdHandler,
  editProductByIdHandler,
  deleteProductByIdHandler,
};
