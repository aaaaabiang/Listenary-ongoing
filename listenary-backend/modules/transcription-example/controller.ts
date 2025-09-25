//  •	接收请求，解析参数。
// •	调用 Service。
// •	返回 HTTP 响应。
// •	不写业务逻辑。

// 示例代码：
// const express = require("express");
// const router = express.Router();
// const userService = require("./user.service");

// router.get("/:id", async (req, res) => {
//   try {
//     const user = await userService.getUserById(req.params.id);
//     res.json(user);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;
