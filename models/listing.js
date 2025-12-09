const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  image: {
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      set: (v) =>
        v === ""
          ? "https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          : v,
    },
    filename: {
      type: String,
      default: "",
    },
  },
  price: {
  type: Number,
  required: true,
  default: 0
},

  location: String,
  country: String,
  geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
  
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
 
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
