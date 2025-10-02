import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = express.Router();

function generateToken(id: string) {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
}

async function registerUser(req: Request, res: Response) {
  const { displayName, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "此邮箱已被注册" });
    }
    const user = await User.create({ displayName, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    }
  } catch (error: any) {
    res.status(400).json({ message: "无效的用户数据", error: error.message });
  }
}

async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: "邮箱或密码无效" });
    }
  } catch (error: any) {
    res.status(500).json({ message: "服务器错误" });
  }
}

// ====== 在这里绑定路由 ======
router.post("/register", registerUser);
router.post("/login", loginUser);

export const authRoutes = router;
