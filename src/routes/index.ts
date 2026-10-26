import { Router } from "express";
import type { Controllers } from "../container";
import { authenticate, authorize } from "../middlewares/auth.middleware";

export function buildRoutes(c: Controllers): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  router.post("/auth/login", c.auth.login);

  router.use(authenticate);

  router.get("/users/me", c.users.me);
  router.post("/users", authorize("admin"), c.users.create);

  router.post("/patients", authorize("admin", "secretary"), c.patients.create);
  router.get("/patients", c.patients.list);
  router.get("/patients/:id", c.patients.getById);
  router.patch(
    "/patients/:id",
    authorize("admin", "secretary"),
    c.patients.update,
  );
  router.delete("/patients/:id", authorize("admin"), c.patients.remove);

  router.post("/doctors", authorize("admin"), c.doctors.create);
  router.get("/doctors", c.doctors.list);
  router.get("/doctors/:id", c.doctors.getById);

  router.put(
    "/doctors/:id/work-schedule",
    authorize("admin"),
    c.schedules.replace,
  );
  router.get("/doctors/:id/work-schedule", c.schedules.get);

  return router;
}
