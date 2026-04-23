require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Center = require('../models/Center');
const Produce = require('../models/Produce');
const Credit = require('../models/Credit');
const Pricing = require('../models/Pricing');
const Order = require('../models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agrilink';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Center.deleteMany({});
    await Produce.deleteMany({});
    await Credit.deleteMany({});
    await Pricing.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data.');

    // --- Create Users (plain-text passwords — model pre-save hook hashes them) ---
    const admin = await User.create({
      name: 'Rajesh Kumar',
      email: 'admin@agrilink.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
    });

    const manager1 = await User.create({
      name: 'Priya Sharma',
      email: 'manager1@agrilink.com',
      phone: '9876543211',
      password: 'manager123',
      role: 'manager',
    });

    const manager2 = await User.create({
      name: 'Amit Patel',
      email: 'manager2@agrilink.com',
      phone: '9876543212',
      password: 'manager123',
      role: 'manager',
    });

    const farmers = [];
    const farmerData = [
      { name: 'Suresh Yadav', email: 'farmer1@agrilink.com', phone: '9876543213', landSize: '5 acres', location: 'Nashik, Maharashtra' },
      { name: 'Meena Devi', email: 'farmer2@agrilink.com', phone: '9876543214', landSize: '3 acres', location: 'Anand, Gujarat' },
      { name: 'Ramesh Singh', email: 'farmer3@agrilink.com', phone: '9876543215', landSize: '8 acres', location: 'Ludhiana, Punjab' },
      { name: 'Lakshmi Bai', email: 'farmer4@agrilink.com', phone: '9876543216', landSize: '2 acres', location: 'Nagpur, Maharashtra' },
      { name: 'Gopal Reddy', email: 'farmer5@agrilink.com', phone: '9876543217', landSize: '6 acres', location: 'Guntur, Andhra Pradesh' },
    ];

    for (const fd of farmerData) {
      const farmer = await User.create({
        ...fd,
        password: 'farmer123',
        role: 'farmer',
      });
      farmers.push(farmer);
    }

    const buyers = [];
    const buyerData = [
      { name: 'FreshMart Ltd', email: 'buyer1@agrilink.com', phone: '9876543001', companyName: 'FreshMart Ltd', gstNumber: '07AAAAA0000A1Z5', location: 'Delhi NCR' },
      { name: 'GreenGrocers Co', email: 'buyer2@agrilink.com', phone: '9876543002', companyName: 'GreenGrocers Co', gstNumber: '27BBBBB0000B1Z5', location: 'Mumbai, Maharashtra' },
    ];
    for (const bd of buyerData) {
      const buyer = await User.create({
        ...bd,
        password: 'buyer123',
        role: 'buyer',
      });
      buyers.push(buyer);
    }

    console.log(`Created ${farmers.length + 3} users.`);

    // --- Create Centers ---
    const center1 = await Center.create({
      name: 'AgriLink Nashik Hub',
      address: 'Krishi Bhavan, MIDC Road, Nashik, Maharashtra 422001',
      location: { lat: 19.9975, lng: 73.7898 },
      managerId: manager1._id,
    });

    const center2 = await Center.create({
      name: 'AgriLink Anand Center',
      address: 'Amul Dairy Road, Anand, Gujarat 388001',
      location: { lat: 22.5645, lng: 72.9289 },
      managerId: manager2._id,
    });

    const center3 = await Center.create({
      name: 'AgriLink Punjab Collection Point',
      address: 'GT Road, Ludhiana, Punjab 141001',
      location: { lat: 30.9010, lng: 75.8573 },
      managerId: null,
    });

    // Assign centers to managers
    await User.findByIdAndUpdate(manager1._id, { assignedCenter: center1._id });
    await User.findByIdAndUpdate(manager2._id, { assignedCenter: center2._id });

    console.log('Created 3 collection centers.');

    // --- Create Produce Entries ---
    const cropPrices = {
      'Wheat': { min: 20, max: 24 },
      'Rice':  { min: 20, max: 25 },
      'Potato': { min: 4, max: 7 },
      'Onion': { min: 7, max: 10 },
    };
    const cropNames = Object.keys(cropPrices);
    const produceEntries = [];

    for (let i = 0; i < 25; i++) {
      const farmer = farmers[Math.floor(Math.random() * farmers.length)];
      const center = [center1, center2, center3][Math.floor(Math.random() * 3)];
      const crop = cropNames[Math.floor(Math.random() * cropNames.length)];
      const { min, max } = cropPrices[crop];
      const quantity = Math.floor(Math.random() * 500) + 50;
      const price = +(min + Math.random() * (max - min)).toFixed(1);

      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      const status = ['pending', 'accepted', 'accepted', 'accepted'][Math.floor(Math.random() * 4)];

      const produce = await Produce.create({
        centerId: center._id,
        farmerId: farmer._id,
        cropType: crop,
        quantity,
        remainingQuantity: status === 'accepted' ? quantity : 0, 
        price,
        status,
        createdAt: date,
      });
      produceEntries.push(produce);
    }

    console.log(`Created ${produceEntries.length} produce entries.`);

    // --- Create Credit Records ---
    for (const farmer of farmers) {
      const creditAmount = Math.floor(Math.random() * 50000) + 10000;
      const repaid = Math.floor(Math.random() * creditAmount * 0.7);

      await Credit.create({
        farmerId: farmer._id,
        totalCredit: creditAmount,
        remainingBalance: creditAmount - repaid,
        transactions: [
          {
            type: 'credit',
            amount: creditAmount,
            description: 'Initial farming credit',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          },
          {
            type: 'repayment',
            amount: Math.floor(repaid * 0.4),
            description: 'First installment',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          {
            type: 'repayment',
            amount: repaid - Math.floor(repaid * 0.4),
            description: 'Second installment',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
        ],
      });
    }

    console.log('Created credit records for all farmers.');

    // --- Create Pricing ---
    const pricingData = [
      { cropType: 'Wheat', centerId: null, basePrice: 22 },
      { cropType: 'Rice', centerId: null, basePrice: 24 },
      { cropType: 'Potato', centerId: null, basePrice: 6 },
      { cropType: 'Onion', centerId: null, basePrice: 9 },
    ];
    await Pricing.insertMany(pricingData);
    console.log('Created pricing rules.');

    // --- Create sample Orders ---
    // Fetch a couple of accepted produces to make simulated orders
    const stockProduce = await Produce.find({ status: 'accepted', remainingQuantity: { $gt: 50 } }).limit(2);
    if (stockProduce.length > 0) {
      await Order.create({
        buyerId: buyers[0]._id,
        items: [{
          cropType: stockProduce[0].cropType,
          centerId: stockProduce[0].centerId,
          quantity: 50,
          basePricePerKg: 22,
          marginPerKg: 2.5,
          deliveryPerKg: 5,
          finalPricePerKg: 29.5,
          subtotal: 50 * 29.5,
        }],
        orderType: 'immediate',
        logistics: 'partner',
        deliveryAddress: 'Delhi NCR FreshMart Warehouse',
        totalAmount: 50 * 29.5,
        status: 'booked',
      });
      console.log('Created sample orders.');
    }

    console.log('\n✅ Seed data created successfully!');
    console.log('\n--- Demo Accounts ---');
    console.log('Admin:   admin@agrilink.com / admin123');
    console.log('Manager: manager1@agrilink.com / manager123');
    console.log('Manager: manager2@agrilink.com / manager123');
    console.log('Farmer:  farmer1@agrilink.com / farmer123');
    console.log('Buyer:   buyer1@agrilink.com / buyer123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
