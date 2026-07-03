import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },

    // level: {
    //     type: Number,
    //     required: true
    // },

    imageUrl: String,

    isActive: {
        type: Boolean,
        default: true
    }
});

const Category = mongoose.model("Catagory", CategorySchema);
export default Category;