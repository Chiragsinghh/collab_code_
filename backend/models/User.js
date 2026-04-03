const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
    },

    googleId: {
      type: String,
    },

    avatar: {
      type: String,
    },
  },
  { timestamps: true }
);

// 🔥 FIXED PRE-SAVE HOOK
userSchema.pre("save", async function () {
  // ✅ Skip if no password (Google users)
  if (!this.password) return;

  // ✅ Skip if not modified
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 🔥 PASSWORD COMPARE
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);