const mongoose = require("mongoose");
const { format } = require("morgan");

const { date_format } = require("../utils");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true }, // reference to the associated book
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

// Virtual for bookinstance's URL
BookInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/bookinstance/${this._id}`;
});

BookInstanceSchema.virtual("due_back_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.due_back).toISODate();
});

BookInstanceSchema.methods.due_back_formatted = function (format) {
  return date_format(format, this.due_back);
};

// Export model
module.exports = mongoose.model("BookInstance", BookInstanceSchema);
