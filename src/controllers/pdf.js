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
  const fontSize = 12;

  // Añadir la primera página y obtener una referencia a ella
  const page1 = pdfDoc.addPage();
  const { width, height } = page1.getSize(); // Obtener el tamaño de la página

  // Añadir la segunda página
  const page2 = pdfDoc.addPage();

  // Añadir texto e imágenes a la primera página
  const drawTextF = async (text, y, x = 0, fontSize = 12, page = page1) => {
    await page.drawText(text, {
      x: x === 0 ? centrarTexto(text, font, fontSize) : x,
      y,
      size: fontSize,
      font,
    });
  };

  const drawImageF = async (path, scale, y, page = page1, x1 = 0) => {
    const buffer = await readFileAsync(path);
    const image = await pdfDoc.embedPng(buffer);
    const dims = image.scale(scale);
    page.drawImage(image, {
      x: x1 == 0 ? (width - dims.width) / 2 : x1,
      y,
      width: dims.width,
      height: dims.height,
    });
  };

  /* const drawBlackBox = async (x, y, width, height, page) => {
    page.drawRectangle({
      x,
      y,
      width,
      height,
      color: rgb(0, 0, 0),
      borderColor: rgb(0, 0, 0),
      borderWidth: 0.01,
    });
  }; */
  const drawBlackBox = (x, y, width, height, borderWidth, page) => {
    // Dibujar los cuatro bordes del recuadro negro
    page.drawLine({
      start: { x, y },
      end: { x: x + width, y },
      thickness: borderWidth,
      color: rgb(0, 0, 0),
    });

    page.drawLine({
      start: { x, y: y + height },
      end: { x: x + width, y: y + height },
      thickness: borderWidth,
      color: rgb(0, 0, 0),
    });

    page.drawLine({
      start: { x, y },
      end: { x, y: y + height },
      thickness: borderWidth,
      color: rgb(0, 0, 0),
    });

    page.drawLine({
      start: { x: x + width, y },
      end: { x: x + width, y: y + height },
      thickness: borderWidth,
      color: rgb(0, 0, 0),
    });
  };

  // Función para centrar el texto en la página
  const centrarTexto = (text, font, size) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    return (width - textWidth) / 2;
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

  await drawTextF(title, height - 250);
  await drawTextF(info, height - 310);
  await drawTextF(nit, height - 330);
  await drawTextF(locality, height - 350);
  await drawImageF(logoPath, 0.35, height - 460);
  await drawImageF(firmaPath, 0.3, height - 545);
  await drawTextF(name, height - 610);
  await drawTextF(role, height - 625);
  await drawTextF(licence, height - 640);
  await drawTextF(date, height - 655);
  await drawTextF(state, height - 800, 0, titleFontSize, page1);
  await drawTextF(year, height - 820, 0, titleFontSize, page1);

  // Añadir contenido a la segunda página
  const y2 = height - 50;

  // Encerrar el logo del título en un recuadro negro
  drawBlackBox(
    (width - width * 0.35) / 2,
    y2 - 50,
    width * 0.35,
    width * 0.35 * 0.2,
    1,
    page2
  );
  await drawImageF(logoPath, 0.2, y2 - 50, page2, 100);

  // Encerrar el texto del título en un recuadro negro
  drawBlackBox(0, y2, width, titleFontSize * 2, 1, page2);
  await drawTextF(title, y2, 0, titleFontSize, page2);

  // Recuadros de texto en la segunda página
  const textLines = ["Texto 1", "Texto 2", "Texto 3", "Texto 4", "Texto 5"];
  const xRight = width - 150;
  let yRight = y2;
  drawBlackBox(
    xRight - 5,
    yRight - 5,
    width - 2 * (xRight - 5),
    fontSize + 10,
    1,
    page2
  ); // Dibujar recuadro negro
  for (const line of textLines) {
    await drawTextF(line, yRight, xRight, fontSize, page2);
    yRight -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  await writeFileAsync("portada.pdf", pdfBytes);
}
