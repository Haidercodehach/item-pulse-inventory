import { useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateInvoicePDF } from "@/utils/htmlInvoiceGenerator";
import {
  canDownloadInventoryReceipt,
  downloadReceiptBlob,
  printReceiptBlob,
  receiptBlobsFromDoc,
} from "@/utils/inventoryReceipt";

interface Props {
  item: { id: string; name: string; quantity: number | null };
}

type Receipt = { downloadBlob: Blob; printBlob: Blob; filename: string };

const InventoryReceiptButton = ({ item }: Props) => {
  const { getSetting, settingsLoading } = useSettings();
  const { toast } = useToast();
  const [isPreparing, setIsPreparing] = useState(false);
  const [ready, setReady] = useState<Receipt | null>(null);

  if (!canDownloadInventoryReceipt(item.quantity)) return null;

  const loadReceipt = async (): Promise<Receipt> => {
    // Find this item's latest sale directly, including older sales beyond the list limit.
    const { data: saleItem, error: itemError } = await supabase
      .from("sale_items")
      .select("sale_id")
      .eq("item_id", item.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (itemError) throw itemError;
    if (!saleItem) throw new Error("No recorded sale was found for this item.");

    // Keep the complete transaction so the receipt's items and totals match.
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("*, sale_items(*, inventory_items(name, sku))")
      .eq("id", saleItem.sale_id)
      .single();
    if (saleError) throw saleError;
    const pdf = await generateInvoicePDF({
      sale,
      company: getSetting("company_info")?.setting_value || {},
      settings: getSetting("invoice_settings")?.setting_value || {},
    });
    return {
      ...receiptBlobsFromDoc(pdf),
      filename: `invoice-${sale.invoice_number.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`,
    };
  };

  const reportError = (error: unknown) =>
    toast({
      title: "Receipt failed",
      description: error instanceof Error ? error.message : "Unable to load the receipt. Please try again.",
      variant: "destructive",
    });

  const run = async (action: "download" | "print") => {
    if (isPreparing) return;
    setIsPreparing(true);
    try {
      const receipt = await loadReceipt();
      // A fresh click preserves user activation on touch devices, especially iOS.
      if (window.matchMedia("(pointer: coarse)").matches) setReady(receipt);
      else if (action === "print") printReceiptBlob(receipt.printBlob);
      else downloadReceiptBlob(receipt.downloadBlob, receipt.filename);
    } catch (error) {
      reportError(error);
    } finally {
      setIsPreparing(false);
    }
  };

  const print = (receipt: Receipt) => {
    try {
      printReceiptBlob(receipt.printBlob);
    } catch (error) {
      reportError(error);
    }
  };

  const busy = isPreparing || settingsLoading;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 bg-background text-foreground border-border hover:bg-secondary"
        title={isPreparing ? "Preparing receipt…" : "Download receipt"}
        aria-label={`Download receipt for ${item.name}`}
        onClick={() => run("download")}
        disabled={busy}
      >
        {isPreparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 bg-background text-foreground border-border hover:bg-secondary"
        title={isPreparing ? "Preparing receipt…" : "Print receipt"}
        aria-label={`Print receipt for ${item.name}`}
        onClick={() => run("print")}
        disabled={busy}
      >
        {isPreparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
      </Button>
      <Dialog open={ready !== null} onOpenChange={(open) => { if (!open) setReady(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Receipt ready</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground break-words">{item.name}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => {
              if (!ready) return;
              downloadReceiptBlob(ready.downloadBlob, ready.filename);
              setReady(null);
            }}>
              <Download className="h-4 w-4 mr-2" /> Download receipt
            </Button>
            <Button onClick={() => {
              if (!ready) return;
              print(ready);
              setReady(null);
            }}>
              <Printer className="h-4 w-4 mr-2" /> Print receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryReceiptButton;
