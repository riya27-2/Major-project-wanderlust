const Listing=require("../models/listing");
const axios = require("axios");
 


module.exports.index=async(req,res)=>{
   let allListings=await Listing.find({});
        res.render("listings/index",{allListings});
    };


module.exports.renderNewForm=(req,res)=>{
    if(!req.isAuthenticated()){
        console.log(req.user);
    req.flash("error","you must be logged in to create listing");
   return res.redirect("/login");
  }
    res.render("listings/new.ejs");
};

module.exports.showlisting=async(req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
  if(!listing){
    req.flash("error","listing does not exist in.");
   return res.redirect("/listings");
  }
  console.log(listing);
  // res.render("listings/show",{listing});
  res.render("listings/show", {
  listing,
  currUser: req.user,
  MAPTILER_TOKEN: process.env.MAPTILER_TOKEN
});
};
module.exports.createListing = async (req, res) => {
    try {
        const { title, description, location,price,country } = req.body.listing;

        // 1) Geocode using MapTiler
        const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAPTILER_TOKEN}`;
        const geoRes = await axios.get(geoUrl);

        if (geoRes.data.features.length === 0) {
            req.flash("error", "Location not found");
            return res.redirect("/listings/new");
        }

        const [lng, lat] = geoRes.data.features[0].center;

        

        // 2) Build ONE listing object
        const listing = new Listing({
            title,
            description,
            price,
            location,
            country,
            geometry: {
                type: "Point",
                coordinates: [lng, lat]
            },
            owner: req.user._id
        });

        // 3) Add image from Cloudinary / multer
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        // 4) Save listing
        await listing.save();

        req.flash("success", "New listing created");
        res.redirect(`/listings/${listing._id}`);

    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong");
        res.redirect("/listings/new");
    }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing does not exist.");
    return res.redirect("/listings");
  }

  let originalImageUrl;

  if (listing.image && listing.image.url) {
    originalImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
  } else {
    originalImageUrl = null;   // no image
  }

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};



module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });

    // Only update image if a new file is uploaded
    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    //console.log(deletedListing);
     req.flash("success","Deleted listing..");
    res.redirect("/listings");
};