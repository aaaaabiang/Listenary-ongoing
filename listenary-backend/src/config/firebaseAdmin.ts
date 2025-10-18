// src/config/firebaseAdmin.ts
import admin from 'firebase-admin';

// 初始化 Firebase Admin SDK
if (!admin.apps.length) {
  // 使用环境变量中的服务账户密钥，如果没有则使用默认配置
  const serviceAccount = process.env.FIREBASE_PRIVATE_KEY ? {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID || "dh2642-29c50",
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  } : undefined;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || "dh2642-29c50",
    });
  } else {
    // 如果没有服务账户密钥，使用默认配置（仅用于开发环境）
    console.warn("Firebase Admin SDK: 未找到服务账户密钥，使用默认配置");
    admin.initializeApp({
      projectId: "dh2642-29c50",
    });
  }
}

export default admin;
