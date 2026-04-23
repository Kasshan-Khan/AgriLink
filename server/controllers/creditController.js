const Credit = require('../models/Credit');

// @desc    Get farmer's credit details
// @route   GET /api/credits/farmer/:farmerId
// @access  Farmer/Admin
const getFarmerCredit = async (req, res) => {
  try {
    let credit = await Credit.findOne({ farmerId: req.params.farmerId }).populate(
      'farmerId',
      'name email phone'
    );

    if (!credit) {
      credit = await Credit.create({ farmerId: req.params.farmerId });
      credit = await Credit.findById(credit._id).populate('farmerId', 'name email phone');
    }

    res.json({ credit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue credit to farmer
// @route   POST /api/credits
// @access  Admin
const issueCredit = async (req, res) => {
  try {
    const { farmerId, amount, description } = req.body;

    let credit = await Credit.findOne({ farmerId });

    if (!credit) {
      credit = await Credit.create({ farmerId });
    }

    credit.totalCredit += amount;
    credit.remainingBalance += amount;
    credit.transactions.push({
      type: 'credit',
      amount,
      description: description || 'Credit issued',
    });

    await credit.save();

    const populated = await Credit.findById(credit._id).populate('farmerId', 'name email phone');
    res.json({ credit: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record repayment
// @route   POST /api/credits/repay
// @access  Admin
const recordRepayment = async (req, res) => {
  try {
    const { farmerId, amount, description } = req.body;

    const credit = await Credit.findOne({ farmerId });

    if (!credit) {
      return res.status(404).json({ message: 'No credit record found for this farmer' });
    }

    if (amount > credit.remainingBalance) {
      return res.status(400).json({ message: 'Repayment amount exceeds remaining balance' });
    }

    credit.remainingBalance -= amount;
    credit.transactions.push({
      type: 'repayment',
      amount,
      description: description || 'Repayment received',
    });

    await credit.save();

    const populated = await Credit.findById(credit._id).populate('farmerId', 'name email phone');
    res.json({ credit: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get credit stats
// @route   GET /api/credits/stats
// @access  Admin
const getCreditStats = async (req, res) => {
  try {
    const stats = await Credit.aggregate([
      {
        $group: {
          _id: null,
          totalCreditGiven: { $sum: '$totalCredit' },
          totalRemaining: { $sum: '$remainingBalance' },
          farmersWithCredit: { $sum: { $cond: [{ $gt: ['$totalCredit', 0] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      totalCreditGiven: stats[0]?.totalCreditGiven || 0,
      totalRecovered: (stats[0]?.totalCreditGiven || 0) - (stats[0]?.totalRemaining || 0),
      totalRemaining: stats[0]?.totalRemaining || 0,
      farmersWithCredit: stats[0]?.farmersWithCredit || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getFarmerCredit, issueCredit, recordRepayment, getCreditStats };
