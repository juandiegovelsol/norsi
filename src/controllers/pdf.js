import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { readFile, writeFile } from "fs/promises";
import fs from "fs";
import { promisify } from "util";
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

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
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const texts = page.getTextContent().items;
      for (const text of texts) {
        console.log(text);
      }
    }
    /* page.drawText("Nuevo texto", {
      x: 5,
      y: 5,
      size: 50,
      font: helveticaFont,
      color: rgb(0.95, 0.1, 0.1),
    }); */
    const pdfBytes = await pdfDoc.save();
    await writeFile(output, pdfBytes);
  } catch (error) {
    console.log(error);
  }
};

export const pdfGenerate = async (req, res) => {
  try {
    const datos = req.body;
    datos.logoPath = "./src/resources/images/logo.png";
    datos.firmaPath = "./src/resources/images/firma.png";
    await generarPortadaPDF(datos);
    res.status(200).json({ message: "Created pdf" });
  } catch (error) {
    console.log(error);
  }
};

async function generarPortadaPDF(datos) {
  // Crear un nuevo documento PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const titleFontSize = 14;
  const page = pdfDoc.addPage();

  // Añadir texto a la portada
  const { width, height } = page.getSize();
  const fontSize = 12;
  const y = height - 250;

  // Centrar los datos en la página
  const centrarTexto = (text, font, size) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    return (width - textWidth) / 2;
  };

  const drawTextF = (text, y1, font, fontSize) => {
    page.drawText(text, {
      x: centrarTexto(text, font, fontSize),
      y: y - y1,
      size: fontSize,
      font,
    });
  };

  const {
    title,
    info,
    nit,
    locality,
    logoPath,
    firmaPath,
    name,
    role,
    licence,
    date,
    state,
    year,
  } = datos;

  drawTextF(title, 0, font, titleFontSize);
  drawTextF(info, 60, font, fontSize);
  drawTextF(nit, 80, font, fontSize);
  drawTextF(locality, 100, font, fontSize);

  const logoBuffer = await readFileAsync(logoPath);
  const logoImage = await pdfDoc.embedPng(logoBuffer);
  const logoDims = logoImage.scale(0.35);
  page.drawImage(logoImage, {
    x: (width - logoDims.width) / 2,
    y: y - 210,
    width: logoDims.width,
    height: logoDims.height,
  });

  const firmaBuffer = await readFileAsync(firmaPath);
  const firmaImage = await pdfDoc.embedPng(firmaBuffer);
  const firmaDims = firmaImage.scale(0.3);
  page.drawImage(firmaImage, {
    x: (width - firmaDims.width) / 2,
    y: y - 295,
    width: firmaDims.width,
    height: firmaDims.height,
  });

  drawTextF(name, 310, font, fontSize);
  drawTextF(role, 325, font, fontSize);
  drawTextF(licence, 340, font, fontSize);
  drawTextF(date, 355, font, fontSize);
  drawTextF(state, 500, font, titleFontSize);
  drawTextF(year, 520, font, titleFontSize);

  const pdfBytes = await pdfDoc.save();
  await writeFileAsync("portada.pdf", pdfBytes);
}
