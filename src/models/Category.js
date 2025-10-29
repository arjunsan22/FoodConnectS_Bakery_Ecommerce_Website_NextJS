import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // No duplicate category names
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  blocked:{
    type:Boolean,
    default:false
  }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
