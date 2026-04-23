const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required'],
    },
    items: [
      {
        cropType: {
          type: String,
          required: true,
        },
        centerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Center',
        },
        quantity: {
          type: Number,
          required: true,
          min: [0.1, 'Quantity must be positive'],
        },
        basePricePerKg: {
          type: Number,
          required: true,
        },
        marginPerKg: {
          type: Number,
          default: 2.5,
        },
        deliveryPerKg: {
          type: Number,
          default: 0,
        },
        finalPricePerKg: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    orderType: {
      type: String,
      enum: ['immediate', 'preorder'],
      required: true,
    },
    logistics: {
      type: String,
      enum: ['own', 'partner'],
      required: true,
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    distance: {
      type: Number,
      default: 0,
    },
    postalCode: {
      type: String,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount must be non-negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'booked', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
