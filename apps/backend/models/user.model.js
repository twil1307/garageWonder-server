import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    username: {
      type: String,
      required: [true, 'Username required'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Password required'],
    },
    email: {
      type: String,
      required: [true, 'Email required'],
    },
    phone: {
      type: String,
      required: false,
    },
    subName: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
    role: {
      type: Number,
      required: true,
      default: 1,
    },
    ggid: {
      type: String,
      required: false,
    },
    wishlistId: {
      type: String,
      required: false,
    },
    selfDescription: {
      type: String,
      required: false,
    },
    salt: {
      type: String,
      required: false,
    },
    bankingAccountNumber: {
      type: String,
      required: false,
    },
    dob: {
      type: Date,
      required: false,
    },
    signAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    favoriteGarage: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Garage',
    },
    bankingAccountNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankingAccount',
    },
 },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
