import { describe, expect, it } from "bun:test";
import {
  canDownloadInventoryReceipt,
  printReceiptBlob,
} from "./inventoryReceipt";

describe("inventory receipt availability", () => {
  it("shows the receipt button when an item is out of stock", () => {
    expect(canDownloadInventoryReceipt(0)).toBe(true);
    expect(canDownloadInventoryReceipt(null)).toBe(true);
  });

  it("hides the receipt button when an item is in stock", () => {
    expect(canDownloadInventoryReceipt(1)).toBe(false);
    expect(canDownloadInventoryReceipt(10)).toBe(false);
  });
});

describe("inventory receipt printing", () => {
  const withStubs = (openResult, body) => {
    const globals = { window: globalThis.window, URL: globalThis.URL, setTimeout: globalThis.setTimeout };
    const opened = [];
    globalThis.window = {
      open: (url) => {
        opened.push(url);
        return openResult;
      },
    };
    globalThis.URL = {
      createObjectURL: () => "blob:receipt",
      revokeObjectURL: () => {},
    };
    globalThis.setTimeout = () => 0;
    try {
      return body(opened);
    } finally {
      Object.assign(globalThis, globals);
    }
  };

  it("opens the receipt in a new window so it can be printed", () => {
    withStubs({}, (opened) => {
      const win = printReceiptBlob(new Blob(["receipt"]));
      expect(win).toBeTruthy();
      expect(opened).toEqual(["blob:receipt"]);
    });
  });

  it("reports a blocked pop-up instead of failing silently", () => {
    withStubs(null, () => {
      expect(() => printReceiptBlob(new Blob(["receipt"]))).toThrow(
        "Pop-ups are blocked",
      );
    });
  });
});
