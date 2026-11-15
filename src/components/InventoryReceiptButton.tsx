import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateInvoicePDF } from "@/utils/htmlInvoiceGenerator";
import { canDownloadInventoryReceipt, downloadReceiptBlob } from "@/utils/inventoryReceipt";

interface Props {
  item: { id: string; name: string; quantity: number | null };
}

const InventoryReceiptButton = ({ item }: Props) => {
  const { getSetting, settingsLoading } = useSettings();
  const { toast } = useToast();
  const [isPreparing, setIsPreparing] = useState(false);
  const [readyFile, setReadyFile] = useState<{ blob: Blob; filename: string } | null>(null);

  if (!canDownloadInventoryReceipt(item.quantity)) return null;

  const prepareReceipt = async () => {
    if (isPreparing) return;
    setIsPreparing(true);
    try {
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
      if (!saleItem) {
        toast({ title: "Receipt unavailable", description: "No recorded sale was found for this item.", variant: "destructive" });
        return;
      }

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
      const file = {
        blob: pdf.output("blob"),
        filename: `invoice-${sale.invoice_number.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`,
      };
      // A fresh click preserves user activation on touch devices, especially iOS.
      if (window.matchMedia("(pointer: coarse)").matches) setReadyFile(file);
      else downloadReceiptBlob(file.blob, file.filename);
    } catch (error) {
      toast({
        title: "Receipt download failed",
        description: error instanceof Error ? error.message : "Unable to load the receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 bg-background text-foreground border-border hover:bg-secondary"
        title={isPreparing ? "Preparing receipt…" : "Download receipt"}
        aria-label={`Download receipt for ${item.name}`}
        onClick={prepareReceipt}
        disabled={isPreparing || settingsLoading}
      >
        {isPreparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      </Button>
      <Dialog open={readyFile !== null} onOpenChange={(open) => { if (!open) setReadyFile(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Receipt ready</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground break-words">{item.name}</p>
          <Button onClick={() => {
            if (!readyFile) return;
            downloadReceiptBlob(readyFile.blob, readyFile.filename);
            setReadyFile(null);
          }}>
            <Download className="h-4 w-4 mr-2" /> Download receipt
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InventoryReceiptButton;