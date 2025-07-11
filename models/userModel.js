const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    surname: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String }, // Google users için boş kalabilir
    googleId: { type: String }, // Google kullanıcıları için
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekle
  }
);

module.exports = mongoose.model("User", userSchema);
