import { PDFDocument } from "pdf-lib";
import { readFile, writeFile } from "fs/promises";

export const pdfStream = async (req, res) => {
  try {
    const pdfDoc = "This is a pdf file";
    await createPdf("pdf/prueba.pdf", "informe.pdf");
    res.status(200).json({ pdf });
  } catch (error) {
    console.log(error);
  }
};

const createPdf = async (input, output) => {
  try {
    const pdfDoc = await PDFDocument.load(await readFile(input));
    console.log(pdfDoc);
  } catch (error) {}
};
