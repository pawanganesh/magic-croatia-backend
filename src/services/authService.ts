import admin from "firebase-admin";
import serviceAccount from "../secrets/magic-croatia-firebase-adminsdk-tqfbp-3b806021b1.json";

class AuthService {
  static admin: admin.app.App;

  constructor() {
    AuthService.admin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
}

export default AuthService;
