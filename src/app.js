import express from "express";
import cors from "cors";
import { pdfGenerate, pdfStream } from "./controllers/pdf.js";

const PORT = 4000;
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", pdfStream);
app.post("/", pdfGenerate);

app.listen(PORT, () => {
  console.log(`Server on port: ${PORT}`);
});
