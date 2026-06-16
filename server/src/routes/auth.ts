import { auth } from "@/controllers/index.js";
import { authMiddileware } from "@/middleware/auth.js";
import { Hono } from "hono";

const authRoute = new Hono();

authRoute.post("/signup", (c) => auth.signupController(c));

authRoute.post("/signin", (c) => auth.signinController(c));

authRoute.post("/signout", (c) => auth.singoutController(c));

authRoute.get("/me", authMiddileware, (c) => auth.fetchMe(c));

export default authRoute;
