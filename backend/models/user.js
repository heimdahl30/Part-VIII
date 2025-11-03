import mongoose from "mongoose";

import uniqueValidator from "mongoose-unique-validator";

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
});

schema.plugin(uniqueValidator);

export default mongoose.model("User", schema);
