import express from "express";
import {
  createEventoController,
  getAllEventos,
  updateEventoController,
  deleteEventoController,
  getEventoById,
} from "../controller/evento.js";
import multer from "multer";
import path from "path";

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); 
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage });


router.get("/", getAllEventos); 
router.get("/:id", getEventoById);

router.post("/", upload.single("imagem_evento"), createEventoController);

router.put("/:id", updateEventoController); 
router.delete("/:id", deleteEventoController); 

export default router;