import mongoose from "mongoose";

function applyBase(schema) {
  // Ensure common schema options
  schema.options = schema.options || {};
  schema.options.timestamps = true;
  schema.options.versionKey = false;

  // Common fields for soft-delete, auditing and metadata
  schema.add({
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  });

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
