const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bankingAccountSchema = new Schema(
  {
    bankingAccountNumber: {
      type: String,
      required: [true, "Banking Account required"],
    },
    amount: {
      type: Number,
      default: 50000,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BankingAccount", bankingAccountSchema);
