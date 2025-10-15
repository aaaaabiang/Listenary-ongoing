import admin from "firebase-admin";

if (!admin.apps.length) {
  // 方式1：在环境里设置 GOOGLE_APPLICATION_CREDENTIALS 指向 service account json
  admin.initializeApp();
  // 方式2（不建议把 JSON 入库）：用环境变量注入：
  // admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)) });
}

export { admin };
