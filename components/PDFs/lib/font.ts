import { jsPDF } from "jspdf";
import { boldFontBase64 } from "./base64fonts/notosans-bold";
import { regularFont64 } from "./base64fonts/notosans-regular";
import { italicFontBase64 } from "./base64fonts/notosans-italic";

/**
 * Adds the Noto Sans font to a jsPDF document instance
 * @param doc The jsPDF document instance
 */

export function addFont(doc: jsPDF): void {
  try {
    // Add the font to jsPDF
    doc.addFileToVFS("NotoSans-Regular.ttf", regularFont64);
    doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");

    doc.addFileToVFS("NotoSans-Bold.ttf", boldFontBase64);
    doc.addFont("NotoSans-Bold.ttf", "NotoSans", "bold");


    doc.addFileToVFS("NotoSans-Italic.ttf", italicFontBase64);
    doc.addFont("NotoSans-Italic.ttf", "NotoSans", "italic");

  } catch (error) {
    console.error("Error loading custom font:", error);
  }
}