import { auth } from "@/controllers/index.js";
import { authMiddileware } from "@/middleware/auth.js";
import { Context, Hono } from "hono";

const authRoute = new Hono();

authRoute.post("/signup", (c) => auth.signupController(c));

authRoute.post("/signin", (c) => auth.signinController(c));

authRoute.post("/signout", (c) => auth.singoutController(c));

authRoute.get("/me", authMiddileware, async (c) => {
  const user = (c as Context).get("user");
  return c.json({ success: true, data: user });
});

export default authRoute;
