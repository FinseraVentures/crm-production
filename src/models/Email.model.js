import mongoose from "mongoose";
import applyBase from "./Base.model.js";

const emailSchema = mongoose.Schema(
	{
		name: { type: String, required: true },
		companyName: { type: String },
		phoneNumber: { type: String , required: true },
		email: { type: String, required: true },
		location: { type: String },
		service: { type: String },
		message: { type: String },
		assignedTo: { type: String, required: true ,default: "unassigned"},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

applyBase(emailSchema);
export default mongoose.model("Email", emailSchema);
