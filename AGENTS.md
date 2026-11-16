# Architecture rules

- Inventory receipt downloads look up the item's latest recorded sale directly and use the shared invoice generator (drawn directly as vector PDF, never screenshotted via html2canvas, to avoid freezing the page) with the complete transaction; this avoids sales-list limits and keeps receipt totals accurate.
- Prepare receipt PDFs before a separate download click on touch devices; this preserves browser user activation for mobile downloads.