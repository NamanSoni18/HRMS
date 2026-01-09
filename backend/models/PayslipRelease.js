const mongoose = require("mongoose");

const PayslipReleaseSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    isReleased: {
      type: Boolean,
      default: false,
    },
    releasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    releasedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index to ensure one record per month-year combination
PayslipReleaseSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("PayslipRelease", PayslipReleaseSchema);
