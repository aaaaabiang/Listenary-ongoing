import admin from "firebase-admin";

if (!admin.apps.length) {
  // 使用项目ID初始化Firebase Admin
  // 注意：在生产环境中，应该使用服务账户密钥文件
  admin.initializeApp({
    projectId: "dh2642-29c50", // 从前端配置中获取的项目ID
    // 开发环境可以使用默认凭据，但需要设置环境变量
    // 或者使用服务账户密钥文件
  });
}

export { admin };
