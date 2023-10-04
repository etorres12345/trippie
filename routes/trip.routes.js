const router = require("express").Router();
const axios = require("axios");
const Trip = require("../models/Trip.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const User = require("../models/User.model");

// Create a new trip
router.post("/trips", isAuthenticated, (req, res, next) => {
  const { userId } = req.payload;
  const { title, city } = req.body;
  let user;
  console.log("The payload", req.payload, req.body);
  //   User.findById(userId)
  //     .then((foundUser) => {
  //       user = foundUser;
  //       console.log("This is the user:", foundUser);
  //       return Trip.create({ title, city, user: foundUser, places: [] });
  //     })
  //     .then((response) => {
  //       console.log("After trip creation:", response);

  //     });
  Trip.create({ title, city, user: userId, places: [] })
    .then((trip) => {
      User.findByIdAndUpdate(trip.user, { $push: { trips: trip._id } });
      res.status(200).json(trip);
    })
    .catch((err) => {
      console.error(err);
      res.json("Oops! something went wrong");
    });
  //   Trip.create({ title, city, user: userId, places: [] })
  //     .then((response) => res.json(response))
  //     .catch((err) => res.json(err));
});

// Fetch a single trip by ID
router.get("/trips", isAuthenticated, (req, res, next) => {
  //   const tripId = req.params.tripId;

  //   Trip.findById(tripId)
  //     .then((trip) => res.json(trip))
  //     .catch((err) => next(err));
  const { _id } = req.payload;

  Trip.find({ user: _id })
    .then((trip) => {
      console.log("the trip=====", trip);
      res.json(trip);
    })
    .catch((err) => next(err));
});

router.get("/trips/:tripId", isAuthenticated, (req, res, next) => {
  const tripId = req.params.tripId;
  console.log("This is the TRIP ID!", tripId);
  //   Trip.findById({ tripId })
  //     .then((oneTrip) => {
  //       console.log("OneTrip====", oneTrip);
  //       res.json(oneTrip);
  //     })
  //     .catch((err) => next(err));
  Trip.findById(tripId)
    // .populate("places")
    .then((trips) => {
      console.log(trips);
      res.json(trips);
    })
    .catch((err) => next(err));
});

// Fetch restaurants in a city
router.get("/restaurants/:city", isAuthenticated, (req, res, next) => {
  const city = req.params.city;
  const apiKey = process.env.googleApiKey;
  const query = `restaurants+in+${city}`;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

  axios
    .get(apiUrl)
    .then((response) => {
      console.log("The restaurants:======,", response.data.results);
      const restaurants = response.data.results;
      res.json(restaurants);
    })
    .catch((err) => next(err));
});

// Add a restaurant to a trip
router.post(
  "/trips/:tripId/add-restaurant",
  isAuthenticated,
  async (req, res, next) => {
    const tripId = req.params.tripId;
    const { restaurantData } = req.body;
    console.log(
      "This is the Trip ID:====",
      tripId,
      "This is the Rest Data:=====",
      restaurantData
    );
    try {
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripId,
        {
          $addToSet: { places: restaurantData },
        },
        { new: true }
      );
      if (!updatedTrip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(updatedTrip);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to add restaurant to trip" });
      // const trip = new Trip()
      // trip.places.push("")
      // trip.save()
      // Trip.findByIdAndUpdate(
      //   tripId,
      //   { $push: { places: restaurantData } },
      //   { new: true }
      // )
      //   .then((updatedTrip) => res.json(updatedTrip))
      //   .catch((err) => next(err));
    }
  }
);

router.delete(
  "/trips/:tripId/remove-restaurant",
  isAuthenticated,
  (req, res, next) => {
    const tripId = req.params.tripId;
    const { restaurantData } = req.body;

    Trip.findByIdAndUpdate(
      tripId,
      { $pull: { places: { place_id: restaurantData.place_id } } },
      { new: true }
    )
      .then((updatedTrip) => res.json(updatedTrip))
      .catch((err) => next(err));
  }
);

// Fetch trips of a specific user
router.get("/trips/user/:userId", isAuthenticated, (req, res, next) => {
  const userId = req.params.userId;

  Trip.find({ user: userId })
    .populate("places")
    .then((trips) => res.json(trips))
    .catch((err) => next(err));
});

// Update a trip by ID
router.put("/trips/:tripId", isAuthenticated, (req, res, next) => {
  const tripId = req.params.tripId;
  const updatedTripData = req.body;

  Trip.findByIdAndUpdate(tripId, updatedTripData, { new: true })
    .then((updatedTrip) => res.json(updatedTrip))
    .catch((err) => next(err));
});

router.post(
  "/trips/:tripId/add-restaurant",
  isAuthenticated,
  (req, res, next) => {
    const tripId = req.params.tripId;
    const { restaurantData } = req.body;

    Trip.findByIdAndUpdate(
      tripId,
      { $push: { places: restaurantData } },
      { new: true }
    )
      .then((updatedTrip) => {
        res.json(updatedTrip);
      })
      .catch((error) => {
        console.error(err);
        res.status(500).json({ error: "Failed to add restaurant to trip" });
      });
  }
);

// Delete a trip by ID
router.delete("/trips/:tripId", isAuthenticated, (req, res, next) => {
  const tripId = req.params.tripId;

  Trip.findByIdAndRemove(tripId)
    .then(() => res.status(204).send())
    .catch((err) => next(err));
});

router.delete(
  "/trips/:tripId/restaurants/:placeId",
  isAuthenticated,
  (req, res, next) => {
    const tripId = req.params.tripId;
    const placeId = req.params.placeId;

    Trip.findByIdAndUpdate(
      tripId,
      { $pull: { places: { place_id: placeId } } },
      { new: true }
    )
      .then((updatedTrip) => res.json(updatedTrip))
      .catch((err) => next(err));
  }
);

module.exports = router;
