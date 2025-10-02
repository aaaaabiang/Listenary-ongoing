import { IUser } from "../../modules/user&wordlist/models/User";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // ✅ 给 Request 扩展 user
    }
  }
}
