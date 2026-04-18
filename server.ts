import express, { Router } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";
import { createClient } from '@supabase/supabase-js';
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Admin
const supabaseAdmin = (process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  const apiRouter = Router();

  // Health check
  apiRouter.get("/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      supabase: !!supabaseAdmin 
    });
  });

  // API Route for Admin: Add Member
  apiRouter.post("/admin/add-member", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Admin is not configured." });
    }

    try {
      const { email, password, role, full_name, phone } = req.body;
      console.log(`[API] Creating user profile: ${email} (${role})`);
      
      // 1. Create User in Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (authError) throw authError;

      // 2. Create Profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert([{ 
          id: authData.user.id, 
          email, 
          role,
          full_name,
          phone
        }]);

      if (profileError) throw profileError;

      res.json({ success: true, user: authData.user });
    } catch (error: any) {
      console.error("Admin add-member error:", error);
      res.status(500).json({ error: error.message || "Failed to add member" });
    }
  });

  // API Route for Excel Generation
  apiRouter.post("/generate-excel", async (req, res) => {
    try {
      const { projectName, materials, clientName } = req.body;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Bill of Materials");

      worksheet.columns = [
        { header: "Item", key: "item", width: 25 },
        { header: "Material", key: "material", width: 20 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "Unit", key: "unit", width: 10 },
        { header: "Cost per Unit (₹)", key: "cost", width: 15 },
        { header: "Total Line Cost (₹)", key: "total", width: 15 },
      ];

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

      const totalRow = worksheet.addRow({
        item: "GRAND TOTAL",
        total: grandTotal,
      });
      totalRow.font = { bold: true };
      
      worksheet.getColumn('cost').numFmt = '"₹"#,##0.00';
      worksheet.getColumn('total').numFmt = '"₹"#,##0.00';

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

  // Mount API Router
  app.use("/api", apiRouter);

  // 404 handler for API routes
  app.all("/api/*", (req, res) => {
    console.warn(`[404] API Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
      error: "API endpoint not found.",
      method: req.method,
      path: req.url
    });
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
