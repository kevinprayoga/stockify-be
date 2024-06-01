"use strict";

const { nanoid } = require("nanoid");
const { Timestamp, FieldValue, Filter } = require("firebase-admin/firestore");

const { db } = require("../../config/firebaseConfig");

const addBusinessInfoHandler = async (request, h) => {
  let businessId = nanoid(16);
  const { businessName, businessAddress, province, city, kecamatan, posCode, userId } =
    request.payload;

  // Validasi payload
  if (!businessName || !businessAddress || !province || !city || !kecamatan || !posCode || !userId)  {
    const response = h.response({
      status: "failed",
      message: "Gagal menambahkan data bisnis. Mohon isi field bisnis Anda dengan lengkap",
    });
    response.code(400);
    return response;
  }

  const createdAt = new Date().toISOString();
  const updatedAt = createdAt;

  try {
    // Memeriksa apakah dokumen dengan ID yang dihasilkan sudah ada
    while ((await db.collection("businessInfo").doc(businessId).get()).exists) {
      businessId = nanoid(16);
    }

    const newBusiness = {
      businessId,
      businessName,
      businessAddress,
      province,
      city,
      kecamatan,
      posCode,
      userId,
      createdAt,
      updatedAt,
    };

    /** Proses menambahkan ke database */
    const businessRef = db.collection("businessInfo").doc(businessId);
    await businessRef.set(newBusiness);

    const isSuccess = await businessRef.get();

    if (!isSuccess.exists) {
      const response = h.response({
        status: "failed",
        message: "Informasi bisnis gagal ditambahkan",
      });
      response.code(500);
      return response;
    }

    const response = h.response({
      status: "success",
      message: "Informasi bisnis berhasil ditambahkan",
      data: {
        businessId,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error("Error adding business info: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal menambahkan informasi bisnis",
    });
    response.code(500);
    return response;
  }
};

const getBusinessInfoByIdHandler = async (request, h) => {
  const userId = request.params;

  try {
    const businessRef = db.collection("businessInfo").where("userID", "==", userId);
    const doc = await businessRef.get();

    const businessData = doc.docs.map((doc) => {
      const data = doc.data();
      return {
        businessId: data.businessId,
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        province: data.province,
        city: data.city,
        kecamatan: data.kecamatan,
        posCode: data.posCode,
        userId: data.userID,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });

    const response = h.response({
      status: "success",
      data: businessData,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error getting business data: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal mendapatkan informasi bisnis",
    });
    response.code(500);
    return response;
  }
};

const editBusinessInfoByIdHandler = async (request, h) => {
  const { businessId } = request.params;

  const { businessName, businessAddress, province, city, kecamatan, posCode } =
    request.payload;

  const updatedAt = new Date().toISOString();

  try {
    const businessRef = db.collection("businessInfo").doc(businessId);
    const doc = await businessRef.get();

    if (!doc.exists) {
      const response = h.response({
        status: "failed",
        message: "Informasi bisnis tidak ditemukan",
      });
      response.code(404);
      return response;
    }

    const updatedBusiness = { updatedAt }; // Selalu perbarui updatedAt

    // Hanya tambahkan atribut ke updatedBusiness jika ada di payload
    if (businessName) updatedBusiness.businessName = businessName;
    if (businessAddress) updatedBusiness.businessAddress = businessAddress;
    if (province) updatedBusiness.province = province;
    if (city) updatedBusiness.city = city;
    if (kecamatan) updatedBusiness.kecamatan = kecamatan;
    if (posCode) updatedBusiness.posCode = posCode;

    await businessRef.update(updatedBusiness);

    const response = h.response({
      status: "success",
      message: "Informasi bisnis berhasil diperbarui",
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error updating business info: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal memperbarui informasi bisnis",
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  addBusinessInfoHandler,
  getBusinessInfoByIdHandler,
  editBusinessInfoByIdHandler,
};
