import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    uid: {
      type: String,
      unique: true,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    emailVerified: {
      type: Boolean,
      required: false
    },
    displayName: {
      type: String,
      required: false
    },
    isAnonymous: {
      type: Boolean,
      required: false
    },
    photoURL: {
      type: String,
      required: false
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    role: {
      type: Number,
      required: true,
      default: 1,
    },
    selfDescription: {
      type: String,
      required: false,
    },
    bankingAccountNumber: {
      type: String,
      required: false,
    },
    createdAt: {
      type: String,
      required: false
    },
    favoriteGarage: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Garage',
    },
    bankingAccountNumber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankingAccount',
    },
    garagesBelongTo: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Garage',
      default: []
    }
 }
);

const Users = mongoose.model("Users", userSchema);

export default Users;