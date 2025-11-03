import mongoose from "mongoose";

import uniqueValidator from "mongoose-unique-validator";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  published: {
    type: Number,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  genres: [{ type: String, required: true }],
});

schema.plugin(uniqueValidator);

export default mongoose.model("Book", schema);
