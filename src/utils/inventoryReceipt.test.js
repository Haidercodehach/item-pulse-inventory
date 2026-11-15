import { describe, expect, it } from "bun:test";
import { canDownloadInventoryReceipt } from "./inventoryReceipt";

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