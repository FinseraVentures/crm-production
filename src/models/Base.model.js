import mongoose from "mongoose";

function applyBase(schema) {
  // Ensure common schema options
  schema.options = schema.options || {};
  schema.options.timestamps = true;
  schema.options.versionKey = false;

  // Common fields for soft-delete, auditing and metadata
  // 🔒 Auto-exclude soft-deleted docs from queries
  schema.pre(
    ["find", "findOne", "findOneAndUpdate", "countDocuments"],
    function (next) {
      if (!this.getQuery().includeDeleted) {
        this.where({ isDeleted: false });
      } else {
        delete this.getQuery().includeDeleted;
      }
      next();
    },
  );

  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    restoredAt: { type: Date, default: null },
    reason: { type: String, default: null },
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  });
  // Soft delete
  schema.methods.softDelete = function (userId, reason = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    this.reason = reason;
    return this.save();
  };

  // Restore
  schema.methods.restore = function (userId) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.restoredAt = new Date();
    this.restoredBy = userId;
    return this.save();
  };

  // Standardize toJSON to remove internal fields
  if (!schema.methods.toJSON) {
    schema.methods.toJSON = function () {
      const obj = this.toObject({ virtuals: true });
      if (obj.__v !== undefined) delete obj.__v;
      return obj;
    };
  }
}

export default applyBase;
