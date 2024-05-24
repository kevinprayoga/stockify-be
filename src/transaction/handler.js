'use strict';

const { nanoid } = require('nanoid');
const { Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const { db } = require('../../db/firebaseConfig');

const addTransactionHandler = async (request, h) => {
  let transactionId = nanoid(20);
  const { businessId, totalPayment } = request.payload;

  const createdAt = new Date().toISOString();

  try {
    // Memeriksa apakah dokumen dengan ID yang dihasilkan sudah ada
    while ((await db.collection('businessInfo').doc(businessId)
      .collection('transaction').doc(transactionId).get()).exists) {
      transactionId = nanoid(20);
    }

    const transactionItemRef = db.collection('businessInfo').doc(businessId).collection('transactionItem');

    // Mendapatkan array dari transactionItem dengan transactionId yang masih kosong
    const transactionItemGet = await transactionItemRef.where('transactionId', '==', '').get();

    if (transactionItemGet.empty) {
      const response = h.response({
        status: 'failed',
        message: 'Tidak ada item transaksi yang bisa ditambahkan',
      });
      response.code(400);
      return response;
    }

    // Menambahkan transactionId untuk yang masih kosong pada transactionItem
    const transactionItemsPromises = transactionItemGet.docs.map(async(doc) => {
      await doc.ref.update({ transactionId: transactionId });
      const data = doc.data();
      return {
        transactionItemId: data.transactionItemId,
        nameItem: data.nameItem,
        count: data.count,
        priceItem: data.priceItem * data.count,
      };
    });

    /** Agar setiap data yang dilakukan mapping dapat terupdate, karena gabisa pakai await saja untuk map */
    const transactionItems = await Promise.all(transactionItemsPromises);

    const newTransaction = {
      transactionId,
      businessId,
      transactionItems,
      totalPayment,
      createdAt,
    };

    // Proses menambahkan ke database
    const transactionRef = db.collection('businessInfo').doc(businessId)
      .collection('transaction').doc(transactionId);
    await transactionRef.set(newTransaction);

    const isSuccess = await transactionRef.get();

    if (!isSuccess.exists) {
      const response = h.response({
        status: 'failed',
        message: 'Transaksi gagal ditambahkan',
      });
      response.code(500);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Transaksi berhasil ditambahkan',
      data: {
        transactionId,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error('Error adding transaction: ', error);
    const response = h.response({
      status: 'error',
      message: 'Gagal menambahkan transaksi',
    });
    response.code(500);
    return response;
  }
};

const getAllTransactionHandler = async (request, h) => {
  const { businessId } = request.params;

  const transactionRef = db.collection('businessInfo').doc(businessId).collection('transaction');

  try {
    const transactionGet = await transactionRef.orderBy('createdAt', 'desc').get();
    const transactions = transactionGet.docs.map((doc) => {
      const data = doc.data();
      return {
        transactionId: data.transactionId,
        businessId: data.businessId,
        transactionItems: data.transactionItems,
        totalPayment: data.totalPayment,
        createdAt: data.createdAt,
      };
    });
    
    const response = h.response({
      status: 'success',
      data: {
        transactions,
      },
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('Error getting all transaction: ', error);
    const response = h.response({
      status: 'error',
      message: 'Gagal mendapatkan transaksi',
    });
    response.code(500);
    return response;
  }
};

const getTransactionByIdHandler = async (request, h) => {
  const { businessId, transactionId } = request.params;

  try {
    const transactionRef = db.collection('businessInfo').doc(businessId).collection('transaction').doc(transactionId);
    const doc = await transactionRef.get();

    if (!doc.exists) {
      const response = h.response({
        status: 'failed',
        message: 'Transaksi tidak ditemukan',
      });
      response.code(404);
      return response;
    }

    // Ekstrak data yang relevan
    const data = doc.data();
    const responseData = {
      transactionId: data.transactionId,
      businessId: data.businessId,
      transactionItems: data.transactionItems,
      totalPayment: data.totalPayment,
      createdAt: data.createdAt,
    };

    const response = h.response({
      status: 'success',
      data: responseData,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('Error getting transaction by id: ', error);
    const response = h.response({
      status: 'error',
      message: 'Gagal mendapatkan transaksi',
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addTransactionHandler,
  getAllTransactionHandler,
  getTransactionByIdHandler,
}