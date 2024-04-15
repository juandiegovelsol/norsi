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

const generarPortadaPDF = async (datos) => {
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
  const page3 = pdfDoc.addPage();

  // Añadir texto e imágenes a la primera página
  const drawTextF = (text, y, x = 0, fontSize = 12, page = page1) => {
    page.drawText(text, {
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

  const drawBlackBox = (x, y, width, height, borderWidth, page) => {
    //x: punto de inicio horizontal
    //y: punto de inicio vertical
    //Ancho
    //Alto
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

  const insertHeader = async (page = page2) => {
    // Añadir contenido a la segunda página
    const y2 = height - 100;

    drawBlackBox(width * 0.15, y2, width * 0.16, titleFontSize * 4, 1, page);
    await drawImageF(logoPath, 0.15, y2 + 10, page, width * 0.15 + 4);

    // Encerrar el texto del título en un recuadro negro
    drawBlackBox(
      width * 0.31,
      y2 + titleFontSize * 1.3,
      width * 0.39,
      titleFontSize * 2.7,
      1,
      page
    );
    drawTextF(title, y2 + titleFontSize * 2.4, 0, titleFontSize * 0.7, page);

    drawBlackBox(width * 0.31, y2, width * 0.13, titleFontSize * 1.3, 1, page);
    drawTextF(
      "GRUPO QUICK",
      y2 + titleFontSize * 0.3,
      width * 0.31 + 4,
      titleFontSize * 0.7,
      page
    );

    drawBlackBox(width * 0.44, y2, width * 0.13, titleFontSize * 1.3, 1, page);
    drawTextF(
      "SONO/030.22",
      y2 + titleFontSize * 0.3,
      width * 0.44 + 8,
      titleFontSize * 0.7,
      page
    );

    drawBlackBox(width * 0.57, y2, width * 0.13, titleFontSize * 1.3, 1, page);
    drawTextF(
      "PR-042-F1",
      y2 + titleFontSize * 0.3,
      width * 0.57 + 15,
      titleFontSize * 0.7,
      page
    );

    drawBlackBox(width * 0.7, y2, width * 0.18, titleFontSize * 4, 1, page);

    // Recuadros de texto en la segunda página
    const textLines = [
      "Estudios de Higiene Ocupacional",
      "Seguridad y Salud en el Trabajo-SSST",
      "Sistemas Integrados de Gestión",
      "Ingeniería",
      "Comercialización",
    ];
    const xRight = width * 0.7 + 5;
    let yRight = y2 + titleFontSize * 3;

    for (const line of textLines) {
      drawTextF(line, yRight, xRight, fontSize * 0.48, page);
      yRight -= 9;
    }
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

  drawTextF(title, height - 250);
  drawTextF(info, height - 310);
  drawTextF(nit, height - 330);
  drawTextF(locality, height - 350);
  await drawImageF(logoPath, 0.35, height - 460);
  await drawImageF(firmaPath, 0.3, height - 545);
  drawTextF(name, height - 610);
  drawTextF(role, height - 625);
  drawTextF(licence, height - 640);
  drawTextF(date, height - 655);
  drawTextF(state, height - 760, 0, titleFontSize, page1);
  drawTextF(year, height - 780, 0, titleFontSize, page1);

  await insertHeader(page2);

  await insertHeader(page3);

  const pdfBytes = await pdfDoc.save();
  await writeFileAsync("portada.pdf", pdfBytes);
};
