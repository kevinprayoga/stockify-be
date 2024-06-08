"use strict";

const { Timestamp, FieldValue, Filter } = require("firebase-admin/firestore");

const { db } = require("../../config/firebaseConfig");

const addUserHandler = async (request, h) => {
  const { userID, username, email } =
    request.payload;

  // Validasi payload
  if (!userID || !username || !email) {
    const response = h.response({
      status: "failed",
      message: "Gagal menambahkan data user. Mohon isi dengan lengkap",
    });
    response.code(400);
    return response;
  }

  const createdAt = new Date().toISOString();

  const userCheck = await db.collection("user").doc(userID).get();
  if (userCheck.exists) {
    const response = h.response({
      status: "failed",
      message: "Gagal menambahkan user. ID user sudah ada",
    });
    response.code(400);
    return response;
  }

  try {
    const newUser = {
      userID,
      username,
      email,
      createdAt,
    };

    /** Proses menambahkan ke database */
    const userRef = db.collection("user").doc(userID);
    await userRef.set(newUser);

    const isSuccess = await userRef.get();

    if (!isSuccess.exists) {
      const response = h.response({
        status: "failed",
        message: "Akun gagal ditambahkan",
      });
      response.code(500);
      return response;
    }

    const response = h.response({
      status: "success",
      message: "Akun berhasil ditambahkan",
      data: {
        userID,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error("Error adding user: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal menambahkan user",
    });
    response.code(500);
    return response;
  }
};

const getUserByIdHandler = async (request, h) => {
  const { userID } = request.params;

  try {
    const userRef = db.collection("user").where("userID", "==", userID);
    const doc = await userRef.get();

    const userData = doc.docs.map((doc) => {
      const data = doc.data();
      return {
        userID: data.userID,
        username: data.username,
        email: data.email,
        createdAt: data.createdAt,
      };
    });

    const response = h.response({
      status: "success",
      data: userData,
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error("Error getting user: ", error);
    const response = h.response({
      status: "error",
      message: "Gagal mendapatkan informasi user",
    });
    response.code(500);
    return response;
  }
};

module.exports = { addUserHandler, getUserByIdHandler };