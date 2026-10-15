// models/User.js — User Mongoose Model
// Defines the User schema for MongoDB with password hashing and safe JSON output.
// Replaces the file-based storage from Part 1 with a proper document store.
//
// Mongoose schema docs: https://mongoosejs.com/docs/guide.html
// Mongoose middleware (pre-save hooks): https://mongoosejs.com/docs/middleware.html
// bcryptjs docs: https://www.npmjs.com/package/bcryptjs
// OWASP Password Storage Cheat Sheet:
// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
// Original bcrypt paper by Provos & Mazieres (1999):
// https://www.usenix.org/legacy/events/usenix99/provos/provos.pdf

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 12 salt rounds = ~4096 iterations. OWASP recommends at least 10 for bcrypt.
// Ref: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#bcrypt
const SALT_ROUNDS = 12;

// User schema definition.
// Ref: https://mongoosejs.com/docs/schematypes.html
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    role: {
      type: String,
      enum: {
        values: ['client', 'freelancer', 'admin'],
        message: 'Role must be client, freelancer, or admin',
      },
      default: 'client',
    },
  },
  {
    // Mongoose adds createdAt and updatedAt automatically with this option
    // Ref: https://mongoosejs.com/docs/timestamps.html
    timestamps: { createdAt: 'createdAt', updatedAt: false },
  }
);

// Pre-save hook: hash the password before storing it in MongoDB.
// Only runs when the password field is new or modified, so updating
// a user's name doesn't re-hash the already-hashed password.
// Ref: https://mongoosejs.com/docs/middleware.html#pre
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// Instance method to compare a plaintext password against the stored hash.
// bcrypt.compare is timing-safe so it doesn't leak info through response times.
// Ref: https://codahale.com/how-to-safely-store-a-password/
// Ref: https://www.npmjs.com/package/bcryptjs#usage---async
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip the password from JSON output so it never leaks to the client.
// This fires whenever we call res.json() with a user document.
// Ref: https://mongoosejs.com/docs/api/document.html#Document.prototype.toJSON()
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Ref: https://mongoosejs.com/docs/models.html
const User = mongoose.model('User', userSchema);

module.exports = User;
