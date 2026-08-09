import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // never store the raw password; `select: false` keeps it out of queries
    passwordHash: { type: String, required: true, select: false },
    // 'authority' predates the admin panel and is still honoured as a
    // privileged role, so existing accounts keep working. New privileged
    // accounts should be created as 'admin'.
    role: {
      type: String,
      enum: ['citizen', 'authority', 'admin'],
      default: 'citizen',
    },
  },
  { timestamps: true },
);

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

/** True for roles allowed into the admin panel (authority + social feeds). */
userSchema.methods.isAdmin = function () {
  return this.role === 'admin' || this.role === 'authority';
};

/** Shape sent to the client — never includes the hash. */
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

export default mongoose.model('User', userSchema);
