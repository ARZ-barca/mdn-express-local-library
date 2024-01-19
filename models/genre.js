const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, maxLength: 100, required: true },
});

genreSchema.virtual("url").get(function () {
  return `/catalog/genre/${this._id}`;
});

module.exports = mongoose.model("Genre", genreSchema);
