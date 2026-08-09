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
      enum: ['citizen', 'authority', 'admin', 'master-admin'],
      default: 'citizen',
    },
    // Area and department assignment for authority/admin accounts
    assignedArea: { type: String, default: null },
    assignedDept: { type: String, default: null },
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
  return ['admin', 'authority', 'master-admin'].includes(this.role);
};

/** True only for the master admin. */
userSchema.methods.isMasterAdmin = function () {
  return this.role === 'master-admin';
};

/** Shape sent to the client — never includes the hash. */
userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    assignedArea: this.assignedArea,
    assignedDept: this.assignedDept,
  };
};

export default mongoose.model('User', userSchema);
