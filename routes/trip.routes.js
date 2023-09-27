const router = require("express").Router();
const axios = require("axios");
const Trip = require("../models/Trip.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

router.post("/trips", (req, res, next) => {
  const { city, userId } = req.body;

  Trip.create({ city, user: userId, places: [] })
    .then((response) => res.json(response))
    .catch((err) => res.json(err));
});

router.get("/trips/:tripId", isAuthenticated, (req, res, next) => {
  const tripId = req.params.tripId;

  // Find the trip by ID and send its details
  Trip.findById(tripId)
    .then((trip) => res.json(trip))
    .catch((err) => next(err));
});

router.get("/restaurants/:city", isAuthenticated, (req, res, next) => {
  const city = req.params.city;
  const apiKey = process.env.googleApiKey;
  const query = `restaurants+in+${city}`;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

  axios
    .get(apiUrl)
    .then((response) => {
      const restaurants = response.data.results;
      res.json(restaurants);
    })
    .catch((err) => next(err));
});

router.post(
  "/trips/:tripId/add-restaurant",
  isAuthenticated,
  (req, res, next) => {
    const tripId = req.params.tripId;
    const restaurantData = req.body;

    // Find the trip by ID and update the places array with the restaurant data
    Trip.findByIdAndUpdate(
      tripId,
      { $push: { places: restaurantData } },
      { new: true }
    )
      .then((updatedTrip) => res.json(updatedTrip))
      .catch((err) => next(err));
  }
);

router.get("/trips/user/:userId", isAuthenticated, (req, res, next) => {
  const userId = req.params.userId;

  // Find all trips belonging to the user
  Trip.find({ user: userId })
    .then((trips) => res.json(trips))
    .catch((err) => next(err));
});

router.put("/trips/:tripId", isAuthenticated, (req, res, next) => {
  const tripId = req.params.tripId;
  const updatedTripData = req.body;

  // Find the trip by ID and update its details
  Trip.findByIdAndUpdate(
    tripId,
    updatedTripData,
    { new: true } // To return the updated trip data
  )
    .then((updatedTrip) => res.json(updatedTrip))
    .catch((err) => next(err));
});

router.delete("/trips/:tripId", isAuthenticated, (req, res, next) => {
  const tripId = req.params.tripId;

  // Find the trip by ID and remove it
  Trip.findByIdAndRemove(tripId)
    .then(() => res.status(204).send()) // Send a success response with no content
    .catch((err) => next(err));
});

module.exports = router;
