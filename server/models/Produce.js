const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema(
  {
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      required: [true, 'Center ID is required'],
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
    },
    cropType: {
      type: String,
      required: [true, 'Crop type is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be positive'],
    },
    remainingQuantity: {
      type: Number,
      min: [0, 'Remaining quantity cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive'],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Calculate total before saving and init remainingQuantity
produceSchema.pre('save', function (next) {
  this.totalAmount = this.quantity * this.price;
  if (this.isNew || this.remainingQuantity === undefined) {
    this.remainingQuantity = this.quantity;
  }
  next();
});

module.exports = mongoose.model('Produce', produceSchema);
