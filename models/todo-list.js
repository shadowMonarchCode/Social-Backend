const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const toDoListsSchema = new Schema({
  name: { type: String, required: true },
  tasks: [
    {
      content: { type: String, required: true },
      markAsDone: { type: Boolean, required: true },
    },
  ],
  creator: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
});

module.exports = mongoose.model("Todo", toDoListsSchema);
