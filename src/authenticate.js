"use strict";

const jwt = require('jsonwebtoken');
const axios = require('axios');
const jwkToPem = require('jwk-to-pem');

const jwksUri = 'https://measured-monitor-27.clerk.accounts.dev/.well-known/jwks.json'; // Ganti dengan URL JWKS

const getClerkJwks = async () => {
  try {
    const response = await axios.get(jwksUri);
    console.log('JWKS fetched successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching Clerk JWKS:', error);
    throw new Error('Unable to fetch Clerk JWKS');
  }
};

const getKey = async (header, callback) => {
  try {
    const jwks = await getClerkJwks();
    console.log('JWKS:', jwks);

    const signingKey = jwks.keys.find(key => key.kid === header.kid);
    console.log('Signing Key:', signingKey);

    if (!signingKey) {
      throw new Error('No matching key found');
    }

    let publicKey;
    if (signingKey.x5c && signingKey.x5c.length) {
      publicKey = `-----BEGIN CERTIFICATE-----\n${signingKey.x5c[0]}\n-----END CERTIFICATE-----`;
    } else {
      publicKey = jwkToPem(signingKey);
    }
    callback(null, publicKey);
  } catch (error) {
    console.error('Error in getKey:', error);
    callback(error);
  }
};

const authenticate = async (request, h) => {
  const headers = request.headers;
  try {
    const clerkToken = headers.authorization.replace('Bearer ', '');
    console.log('Token received: ', clerkToken);

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(clerkToken, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });

    console.log('Decoded token:', decoded);

    request.user = decoded;
    return h.continue;
  } catch (error) {
    console.log('Authentication error: ', error.message);
    return h.response({ error: 'Unauthorized' }).code(401).takeover();
  }
};

module.exports = authenticate;
