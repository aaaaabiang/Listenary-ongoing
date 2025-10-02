import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IWord {
  word: string;
  phonetic?: string;
  phonetics?: object[];
  meanings?: object[];
}

interface IPodcast {
  title: string;
  rssUrl: string;
  coverImage?: string;
  description?: string;
}

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  displayName?: string;
  wordlist: IWord[];
  savedPodcasts: IPodcast[];
  matchPassword(enteredPassword: string): Promise<boolean>;
}

/**
 * 用于定义用户单词本中单个单词结构的子文档模式 (Sub-schema)。
 * 设置为 `{ _id: false }` 使其成为一个轻量级的内嵌文档，不单独生成ID。
 */
const wordSchema = new Schema<IWord>(
  {
    word: {
      type: String,
      required: true,
    },
    phonetic: String,
    phonetics: [Object],
    meanings: [Object],
  },
  { _id: false }
);

/**
 * 用于定义用户保存的播客结构的子文档模式 (Sub-schema)。
 * 同样为了简洁，配置为 `{ _id: false }`。
 */
const podcastSchema = new Schema<IPodcast>(
  {
    title: {
      type: String,
      required: true,
    },
    rssUrl: {
      type: String,
      required: true,
    },
    coverImage: String,
    description: String,
  },
  { _id: false }
);

/**
 * 用户 (User) 文档的主模式 (Schema)，这是应用程序用户的核心数据结构定义。
 */
const userSchema = new Schema<IUser>(
  {
    // 用户的邮箱，现在是用于登录的主要唯一标识符。
    email: {
      type: String,
      required: [true, "请输入邮箱地址"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "请输入有效的邮箱地址",
      ],
    },

    // 用户的密码，在保存到数据库前会被哈希加密。
    password: {
      type: String,
      required: [true, "请输入密码"],
      minlength: 6,
      select: false,
    },

    // 用户的可选显示名称。
    displayName: String,

    // 【关键修改】为这两个数组字段添加了 `default` 选项。
    // 这能确保在创建新用户时，即使不提供这些字段，它们也会被初始化为空数组 `[]`。
    wordlist: {
      type: [wordSchema],
      default: [],
    },
    savedPodcasts: {
      type: [podcastSchema],
      default: [],
    },
  },
  {
    // 自动添加 `createdAt` 和 `updatedAt` 时间戳字段。
    timestamps: true,
  }
);

/**
 * Mongoose 中间件 (pre-save 钩子)。
 * 在每次调用 `.save()` 保存用户文档之前自动执行，用于加密密码。
 */
userSchema.pre("save", async function (next) {
  // 如果密码字段未被修改，则跳过加密过程。
  if (!this.isModified("password")) {
    return next();
  }

  // 生成“盐”并对密码进行哈希处理。
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Mongoose 实例方法。
 * 为每个用户文档实例添加 `matchPassword` 方法，用于安全地比较密码。
 * @param {string} enteredPassword - 用户登录时输入的明文密码。
 * @returns {Promise<boolean>} - 如果密码匹配则返回 true，否则返回 false。
 */
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 将 Schema 编译成一个 Model。
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// 导出 Model 以便在其他文件中使用。
export default User;
