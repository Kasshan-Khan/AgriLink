const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema(
  {
    cropType: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      default: null, // Null means it's a global base price, otherwise specific to center
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price per kg is required'],
      min: [0, 'Base price must be positive'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optional: Prevent duplicate pricing rules for the same crop + center pair
pricingSchema.index({ cropType: 1, centerId: 1 }, { unique: true });

module.exports = mongoose.model('Pricing', pricingSchema);
