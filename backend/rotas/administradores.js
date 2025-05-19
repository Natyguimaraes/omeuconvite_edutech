import express from "express";
import { loginAdmin, registerAdmin, buscarAdministradorLogado, buscarAdminPorIdDireto } from "../controller/admin.js";
import { autenticar } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginAdmin);


router.post("/", registerAdmin);

// Rota para buscar informações do administrador logado (protegida)
router.get("/me", autenticar, buscarAdministradorLogado);

router.get("/:id", buscarAdminPorIdDireto);

export default router;
