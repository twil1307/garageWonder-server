import catchAsync from '../utils/catchAsync.js';
import Category from '../models/category.model.js';
import dataResponse from '../utils/dataResponse.js';
import config from '../config/vnpay.js';
import querystring from 'qs';
import crypto from 'crypto';
import moment from 'moment';
import { sortObject } from '../helper/payment.helper.js';

export const getAllCategories = catchAsync(async (_, res) => {
    const listCategory = await Category.find({});

    return res.status(200).json(dataResponse(listCategory))
})

export const createNewCategory = catchAsync(async (req, res) => {
    const newCategory = new Category(req.body);

    const categoryData = await newCategory.save();

    return res.status(200).json(dataResponse(categoryData, 200));
})

export const getPaymentUrl = catchAsync(async (req, res, next) => {
        process.env.TZ = 'Asia/Ho_Chi_Minh';
    
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
        
        let tmnCode = config['vnp_TmnCode'];
        let secretKey = config['vnp_HashSecret'];
        let vnpUrl = config['vnp_Url'];
        let returnUrl = config['vnp_ReturnUrl'];
        let orderId = moment(date).format('DDHHmmss');
        let amount = req.body.amount;
        let bankCode = req.body.bankCode;
        
        let locale = req.body.language;
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if(bankCode !== null && bankCode !== ''){
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        let signData = querystring.stringify(vnp_Params, { encode: false }); 
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        return res.status(200).json(dataResponse({url: vnpUrl}, 200, 'Get payment url successfully'))
    
});