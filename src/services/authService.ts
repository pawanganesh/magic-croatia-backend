import admin from 'firebase-admin';
import firebaseAdminConfig from 'config/firebaseAdmin';

class AuthService {
  static admin: admin.app.App;

  constructor() {
    AuthService.admin = admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig),
    });
  }
}

export default AuthService;
