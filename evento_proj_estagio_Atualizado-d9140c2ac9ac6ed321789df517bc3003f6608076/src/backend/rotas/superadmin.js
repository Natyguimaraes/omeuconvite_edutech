
import express from "express";

import {
  cadastrarPlanoController,
  listarPlanosController,
  liberarAdministradorController,
  listarAdministradoresController,
  desativarAdministradorController,
  listarEventosPorAdministradorController,
  buscarAdministradorPorIdController,
} from "../controller/SuperAdminController.js";


const router = express.Router();


  router.post("/planos", cadastrarPlanoController);

router.get("/planos", listarPlanosController);


router.post("/liberar-administrador", liberarAdministradorController);

router.get("/administradores", listarAdministradoresController);


router.put("/administradores/:id/desativar", desativarAdministradorController);


router.get("/administradores/:id/eventos", listarEventosPorAdministradorController);

router.get("/administradores/:id", buscarAdministradorPorIdController);


export default router;