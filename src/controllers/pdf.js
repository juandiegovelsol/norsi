import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { readFile, writeFile } from "fs/promises";

export const pdfStream = async (req, res) => {
  try {
    const pdfDoc = "This is a pdf file";
    await createPdf("pdf/prueba.pdf", "informe.pdf");
    res.status(200).json({ pdfDoc });
  } catch (error) {
    console.log(error);
  }
};

const createPdf = async (input, output) => {
  try {
    const pdfDoc = await PDFDocument.load(await readFile(input));
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    console.log(pdfDoc);
    const page = pdfDoc.getPages()[0];
    page.drawText("Nuevo texto", {
      x: 5,
      y: 5,
      size: 50,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    });
    const pdfBytes = await pdfDoc.save();
    await writeFile(output, pdfBytes);
  } catch (error) {
    console.log(error);
  }
};
