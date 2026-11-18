import { describe, expect, it } from "bun:test";
import {
  formatPaymentMethod,
  formatSaleType,
  generateInvoicePDF,
  invoiceDeviceLines,
} from "./htmlInvoiceGenerator";

const device = {
  inventory_items: {
    name: "iPhone 13 Pro",
    sku: "353312345678901",
    description: "Unlocked and fully tested",
    storage: "256 GB",
    color: "Graphite",
    condition: "Usato 94%",
  },
};

describe("invoice device details", () => {
  it("includes every requested device field on the receipt", () => {
    expect(invoiceDeviceLines(device)).toEqual([
      "Device Name: iPhone 13 Pro",
      "IMEI Number: 353312345678901",
      "Description: Unlocked and fully tested",
      "Storage: 256 GB",
      "Details: Color: Graphite; Condition: Usato 94%",
      "Sale Type: Used",
    ]);
  });

  it("keeps all fields visible when an older item has missing details", () => {
    const lines = invoiceDeviceLines({ inventory_items: null });
    expect(lines).toHaveLength(6);
    expect(lines).toContain("Description: Not provided");
    expect(lines).toContain("Storage: Not provided");
    expect(lines).toContain("Details: Not provided");
    expect(lines).toContain("Sale Type: Other / Not set");
  });

  it("uses the same New and Used condition groups as inventory", () => {
    expect(formatSaleType("Nuovo")).toBe("New");
    expect(formatSaleType("apple refurbished")).toBe("Used");
    expect(formatSaleType("Usato 85%")).toBe("Used");
    expect(formatSaleType("")).toBe("Other / Not set");
  });

  it("labels card and cash payments clearly", () => {
    expect(formatPaymentMethod("card")).toBe("Card");
    expect(formatPaymentMethod("CASH")).toBe("Cash");
    expect(formatPaymentMethod(null)).toBe("Not provided");
  });

  it("writes the device fields and payment method into the PDF", async () => {
    const doc = await generateInvoicePDF({
      sale: {
        invoice_number: "INV-TEST-1",
        created_at: "2026-11-18T12:00:00Z",
        subtotal: 520,
        discount_amount: 0,
        tax_amount: 0,
        total_amount: 520,
        payment_method: "card",
        sale_items: [{ ...device, quantity: 1, unit_price: 520, total_price: 520 }],
      },
      company: { name: "Test Shop" },
      settings: {},
    });
    const pdf = doc.output();
    for (const text of ["Device Name:", "IMEI Number:", "Description:", "Storage:", "Details:", "Sale Type:", "Payment Method:", "Card"]) {
      expect(pdf).toContain(text);
    }
  });
});
