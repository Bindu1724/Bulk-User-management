const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Core Identity Fields
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Full name must be at least 3 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: { 
      type: String, required: [true, 'Password is required'] },
    role : {
      type: String, default: "user"
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [
        /^[0-9]{10,}$/,
        'Phone number must contain only digits and be at least 10 digits'
      ]
    },

    // Financial Fields
    walletBalance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative']
    },

    // Account Status Fields
    isBlocked: {
      type: Boolean,
      default: false
    },
    kycStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },

    // Device & Tracking Information
    deviceInfo: {
      ipAddress: String,
      deviceType: {
        type: String,
        enum: ['Mobile', 'Desktop', '']
      },
      os: {
        type: String,
        enum: ['Android', 'iOS', 'Windows', 'macOS', '']
      }
    }
  },
  {
    timestamps: true // Automatically creates createdAt and updatedAt
  }
);

// Indexes for unique fields
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
