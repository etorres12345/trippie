const { Schema, model } = require("mongoose");

const tripSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    city: String,
    places: [
      {
        _id: false,
        name: String,
        category: String,
      },
    ],
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Trip = model("Trip", tripSchema);
module.exports = Trip;
