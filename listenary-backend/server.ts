import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { transcriptionRoutes } from "./modules/transcription-example/controller";
// 挂载路由
const app = express();
app.use(bodyParser.json());
app.use("/api/transcriptions", transcriptionRoutes);
// 健康检查接口
app.get("/health", function (req: Request, res: Response) {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`🚀 Server running on port ${PORT}`);
});
