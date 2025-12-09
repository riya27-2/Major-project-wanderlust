
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// INDEX + CREATE
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// NEW LISTING FORM
router.get("/new", isLoggedIn, listingController.renderNewForm);
//search counntry
router.get("/search", wrapAsync(async (req, res) => {
    const query = req.query.country;
    console.log("Searching:", query);

    let listings;
    if (!query || query.trim() === "") {
        listings = await Listing.find({});
    } else {
        listings = await Listing.find({
            $or: [
                { country: { $regex: new RegExp(query, "i") } },
                { location: { $regex: new RegExp(query, "i") } }
            ]
        });
    }

    res.render("listings/index", { allListings: listings });
}));

// SHOW + UPDATE + DELETE
router.route("/:id")
    .get(wrapAsync(listingController.showlisting)) 
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );

// EDIT FORM
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);


// SEARCH BY COUNTRY


module.exports = router;
