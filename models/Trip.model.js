const { Schema, model } = require("mongoose");

const tripSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Title is requred"],
    },
    city: String,
    places: [],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Trip = model("Trip", tripSchema);
module.exports = Trip;
