'use strict';

const { nanoid } = require('nanoid');
const { Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

const { db } = require('../../config/firebaseConfig');

const addTransactionItemHandler = async (request, h) => {
  let transactionItemId = nanoid(20);
  const {
    businessId,
    nameItem,
    priceItem,
    count,
    image,
  } = request.payload;

  const transactionId = '';

  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  try {
    // Memeriksa apakah dokumen dengan ID yang dihasilkan sudah ada
    while ((await db.collection('businessInfo').doc(businessId)
      .collection('transactionItem').doc(transactionItemId).get()).exists) {
      transactionItemId = nanoid(20);
    }

    const newTransactionItem = {
      transactionItemId,
      businessId,
      transactionId,
      nameItem,
      priceItem,
      count,
      image,
      createdAt,
      updatedAt,
    };

    /** Proses menambahkan ke database */
    const transactionItemRef = db.collection('businessInfo').doc(businessId)
    .collection('transactionItem').doc(transactionItemId);
    await transactionItemRef.set(newTransactionItem);

    const isSuccess = await transactionItemRef.get();

    if (!isSuccess.exists) {
      const response = h.response({
        status: 'failed',
        message: 'Item untuk transaksi gagal ditambahkan',
      });
      response.code(500);
      return response;
    }

    const response = h.response({
      status: 'success',
      message: 'Item untuk transaksi berhasil ditambahkan',
      data: {
        transactionItemId,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error('Error adding transactionItem: ', error);
    const response = h.response({
      status: 'error',
      message: 'Gagal menambahkan item untuk transaksi',
    });
    response.code(500);
    return response;
  }
};

const getTransactionItemUnOrderHandler = async (request, h) => {
  const { businessId } = request.params;

  const transactionItemRef = db.collection('businessInfo').doc(businessId).collection('transactionItem');

  try {
    const transactionItemGet = await transactionItemRef.where('transactionId', '==', '').get();
    const transactionItems = transactionItemGet.docs.map((doc) => {
      const data = doc.data();
      return {
        transactionItemId: data.transactionItemId,
        businessId: data.businessId,
        transactionId: data.transactionId,
        nameItem: data.nameItem,
        priceItem: data.priceItem,
        count: data.count,
        image: data.image,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
    
    const response = h.response({
      status: 'success',
      data: transactionItems,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('Error getting all transactionItem: ', error);
    const response = h.response({
      status: 'error',
      message: 'Gagal mendapatkan item untuk transaksi',
    });
    response.code(500);
    return response;
  }
};

const getTransactionItemByIdHandler = async (request, h) => {
  const { businessId, transactionItemId } = request.params;

  try {
    const transactionItemRef = db.collection('businessInfo').doc(businessId).collection('transactionItem').doc(transactionItemId);
    const doc = await transactionItemRef.get();

    if (!doc.exists) {
      const response = h.response({
        status: 'failed',
        message: 'Item untuk transaksi tidak ditemukan',
      });
      response.code(404);
      return response;
    }

    // Ekstrak data yang relevan
    const data = doc.data();
    const responseData = {
      transactionItemId: data.transactionItemId,
      businessId: data.businessId,
      transactionId: data.transactionId,
      nameItem: data.nameItem,
      priceItem: data.priceItem,
      count: data.count,
      image: data.image,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    const response = h.response({
      status: 'success',
      data: responseData,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('Error getting transactionItem by id: ', error);
    const response = h.response({
      status: 'error',
      message: 'Gagal mendapatkan item untuk transaksi',
    });
    response.code(500);
    return response;
  }
};

const editTransactionItemByIdHandler = async (request, h) => {
  const { businessId, transactionItemId } = request.params;
  const { count } = request.payload;

  const updatedAt = new Date().toISOString();

  try {
    const transactionItemRef = db.collection('businessInfo').doc(businessId).collection('transactionItem').doc(transactionItemId);
    const doc = await transactionItemRef.get();

    if (!doc.exists) {
      const response = h.response({
        status: 'failed',
        message: 'Item untuk transaksi tidak ditemukan',
      });
      response.code(404);
      return response;
    }

    const updatedTransactionItem = { updatedAt }; // Selalu perbarui updatedAt

    // Hanya tambahkan atribut ke updatedTransactionItem jika ada di payload
    if (count) updatedTransactionItem.count = count;

    /** Validasi jumlah count */
    if (count < 1) {
      await transactionItemRef.delete();
      const response = h.response({
        status: 'success',
        message: 'Item untuk transaksi berhasil dihapus',
      });
      response.code(200);
      return response;
    }

    await transactionItemRef.update(updatedTransactionItem);
    const response = h.response({
      status: 'success',
      message: 'Item untuk transaksi berhasil diperbarui',
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('Error updating transactionItem: ', error);
    const response = h.response({
      status: 'error',
      message: 'Gagal memperbarui item untuk transaksi',
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addTransactionItemHandler,
  getTransactionItemUnOrderHandler,
  getTransactionItemByIdHandler,
  editTransactionItemByIdHandler,
}