const mongoose = require("mongoose");
const { Schema } = mongoose;

const WorkplaceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "İş yeri adı zorunludur."],
      trim: true,
    },
    dailyWage: {
      type: Number,
      required: [true, "Günlük yevmiye zorunludur."],
    },
    color: {
      type: String,
      required: [true, "Renk zorunludur."],
      default: "#3B82F6",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workplace", WorkplaceSchema);
