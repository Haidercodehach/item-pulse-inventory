import type jsPDF from "jspdf";

export const canDownloadInventoryReceipt = (quantity: number | null) =>
  (quantity ?? 0) === 0;

export function downloadReceiptBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

// Builds both files a receipt needs: the plain PDF for download, and one marked
// to open straight into the browser's print dialog.
export function receiptBlobsFromDoc(doc: jsPDF) {
  const downloadBlob = doc.output("blob");
  doc.autoPrint();
  return { downloadBlob, printBlob: doc.output("blob") };
}

// Opens the receipt in a new tab so it can be printed without saving a file.
export function printReceiptBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const opened = window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  if (!opened) {
    throw new Error(
      "Pop-ups are blocked for this site — allow them to print the receipt.",
    );
  }
  return opened;
}
