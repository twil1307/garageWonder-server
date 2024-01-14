// require("dotenv").config();
// const BankingAccount = require("../models/BankingAccount");
// const User = require("../models/User");
// const catchAsync = require("../utils/catchAsync");


// const verifyBankingAccount = catchAsync(async (req, res, next) => {
//   const userId = req.user._id;

//   const userBankingAcocunt = await User.findById(userId);

//   if (!userBankingAcocunt.bankingAccountNumber) {
//     return res.status(400).json({ error: "User have no banking account yet!" });
//   }

//   const isBankingAccountExist = await BankingAccount.findById(
//     userBankingAcocunt.bankingAccountNumber
//   );

//   if (!isBankingAccountExist) {
//     return res.status(400).json({
//       error:
//         "Current banking account is not available! Please check your banking account again to make sure it is verified!",
//     });
//   }

//   next();
// });

// module.exports = { verifyBankingAccount };
