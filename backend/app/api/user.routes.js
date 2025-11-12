// app/routes/user.routes.js
import { Router } from "express";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.post("/", userController.createUser);         // POST /users
router.get("/:id", userController.getUser);          // GET /users/:id
router.get("/email/:email", userController.getUserByEmail); // GET /users/email/:email
router.put("/:id", userController.updateUser);       // PUT /users/:id
router.delete("/:id", userController.deleteUser);    // DELETE /users/:id
router.get("/:id/is-admin", userController.checkIsAdmin); // GET /users/:id/is-admin

export default router;
