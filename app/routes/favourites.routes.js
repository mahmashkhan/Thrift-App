import { Router } from "express";
const router = Router();

import { getMyFavourites, toggleFavourite } from "../controllers/favourites.controller.js";
import { allowedUsers } from "../middleware/authorizationMiddleware.js";

router.get('/get', allowedUsers(), getMyFavourites);   // get all favourites
router.post('/add/:productId', allowedUsers(), toggleFavourite);  // add or remove


export default router;