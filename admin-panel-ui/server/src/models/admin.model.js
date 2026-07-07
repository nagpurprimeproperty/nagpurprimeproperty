import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken'
import env from '../config/env.js';
import {
    ADMIN_ROLLS_ENUM,
    MAX_FIRST_NAME_LENGTH,
    MIN_FIRST_NAME_LENGTH,
    MIN_LAST_NAME_LENGTH,
    MAX_LAST_NAME_LENGTH,
    MAX_LAST_NAME_LENGTH_MESSAGE,
    MIN_FIRST_NAME_LENGTH_MESSAGE,
    MIN_LAST_NAME_LENGTH_MESSAGE,
    MAX_FIRST_NAME_LENGTH_MESSAGE,
    INVALID_ROLE_MESSAGE,
    EMAIL_REGEX,
    EMAIL_REGEX_MESSAGE,
    PHONE_REGEX,
    PHONE_REGEX_MESSAGE,
    MIN_PASSWORD_LENGTH,
    MIN_PASSWORD_LENGTH_MESSAGE,
    MAX_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH_MESSAGE,
    MAX_BIO_LENGTH,
    MAX_BIO_LENGTH_MESSAGE
} from "../constants/admin.constants.js";

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        minlength: [MIN_FIRST_NAME_LENGTH, MIN_FIRST_NAME_LENGTH_MESSAGE],
        maxlength: [MAX_FIRST_NAME_LENGTH, MAX_FIRST_NAME_LENGTH_MESSAGE],
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        trim: true,
        required: [true, 'Last name is required'],
        minlength: [MIN_LAST_NAME_LENGTH, MIN_LAST_NAME_LENGTH_MESSAGE],
        maxlength: [MAX_LAST_NAME_LENGTH, MAX_LAST_NAME_LENGTH_MESSAGE]
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Email is required'],
        unique: true,
        match: [EMAIL_REGEX, EMAIL_REGEX_MESSAGE]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [MIN_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH_MESSAGE],
        maxlength: [MAX_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH_MESSAGE],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [PHONE_REGEX, PHONE_REGEX_MESSAGE]
    },
    bio: {
        type: String,
        maxlength: [MAX_BIO_LENGTH, MAX_BIO_LENGTH_MESSAGE]
    },
    role: {
        type: String,
        enum: { values: ADMIN_ROLLS_ENUM, message: INVALID_ROLE_MESSAGE },
        required: [true, 'Role is required']
    },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
    refreshToken: { type: String, select: false },
    refreshTokenExpiry: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
},
    { timestamps: true }
);


adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

adminSchema.methods.generateResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.resetTokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes
  return rawToken; // send raw token in email, store hashed
};

adminSchema.methods.generateRefreshToken = function () {
  const rawToken = crypto.randomBytes(64).toString('hex');
  this.refreshToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  this.refreshTokenExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  return rawToken; // send raw token to client, store hashed
};

adminSchema.methods.comparePassword = async function (password) {
    if (!this.password) throw new Error('Password not selected');
    return bcrypt.compare(password, this.password);
};


adminSchema.methods.generateToken = function () {
    return jwt.sign({ id: this._id, role: this.role, isActive: this.isActive }, env.JWT_SECRET, { expiresIn: '1d' });
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;