
const Listing = require("../models/listing");
const Review = require("../models/review");

// Create a new review
module.exports.createReview = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        const newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        listing.reviews.push(newReview);

        await newReview.save();
        await listing.save();

        req.flash("success", "New review created");
        res.redirect(`/listings/${listing._id}`);
    } catch (e) {
        req.flash("error", "Cannot create review");
        res.redirect("/listings");
    }
};

// Delete a review
module.exports.destroyReview = async (req, res) => {
    try {
        const { id, reviewId } = req.params;

        // Remove review reference from listing
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        // Delete review document
        await Review.findByIdAndDelete(reviewId);

        req.flash("success", "Review deleted");
        res.redirect(`/listings/${id}`);
    } catch (e) {
        req.flash("error", "Cannot delete review");
        res.redirect(`/listings/${id}`);
    }
};
