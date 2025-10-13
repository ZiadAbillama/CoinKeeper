const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt & updatedAt automatically
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
