import { ServiceAccount } from "firebase-admin";

export default {
  type: "service_account",
  project_id: "magic-croatia",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID as string,
  private_key: process.env.FIREBASE_PRIVATE_KEY as string,
  client_email: process.env.FIREBASE_CLIENT_EMAIL as string,
  client_id: process.env.FIREBASE_CLIENT_ID as string,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: process.env
    .FIREBASE_AUTH_PROVIDER_x509_CERT_URL as string,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_x509_CERT_URL as string,
} as ServiceAccount;
