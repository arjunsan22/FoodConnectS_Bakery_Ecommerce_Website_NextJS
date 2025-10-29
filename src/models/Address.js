import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming your user model is named "User"
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    place: {
      type: String,
      required: true,
      trim: true,
    },
    streetMark: {
      // Matches your field name; consider "landmark" if more standard
      type: String,
      default: "",
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: Number, // or String if leading zeros are needed
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    houseNo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure a user can have multiple addresses, but you might want to limit later via app logic
const Address =
  mongoose.models.Address || mongoose.model("Address", addressSchema);
export default Address;
