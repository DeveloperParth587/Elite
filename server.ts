import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Excel Generation
  app.post("/api/generate-excel", async (req, res) => {
    try {
      const { projectName, materials, clientName } = req.body;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Bill of Materials");

      // Set columns
      worksheet.columns = [
        { header: "Item", key: "item", width: 25 },
        { header: "Material", key: "material", width: 20 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "Unit", key: "unit", width: 10 },
        { header: "Cost per Unit (₹)", key: "cost", width: 15 },
        { header: "Total Line Cost (₹)", key: "total", width: 15 },
      ];

      // Styling Header
      worksheet.getRow(1).font = { bold: true };

      let grandTotal = 0;
      materials.forEach((m: any) => {
        const lineTotal = (m.qty || 0) * (m.cost || 0);
        grandTotal += lineTotal;
        worksheet.addRow({
          item: m.item,
          material: m.material,
          qty: m.qty,
          unit: m.unit,
          cost: m.cost,
          total: lineTotal,
        });
      });

      // Add Total Row
      const totalRow = worksheet.addRow({
        item: "GRAND TOTAL",
        total: grandTotal,
      });
      totalRow.font = { bold: true };
      
      // ₹ Currency formatting for cost and total columns
      worksheet.getColumn('cost').numFmt = '"₹"#,##0.00';
      worksheet.getColumn('total').numFmt = '"₹"#,##0.00';

      // Set headers for file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${projectName.replace(/\s+/g, "_")}_BOM.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating Excel:", error);
      res.status(500).json({ error: "Failed to generate Excel" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
