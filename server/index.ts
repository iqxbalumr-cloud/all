import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  // Initialize Gemini
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());
  
  // ... existing db ...
  const db = {
    schools: [
      { id: 's1', name: 'High School Campus A', address: 'Jl. Pendidikan No. 123', status: 'ACTIVE' }
    ],
    attendance: [] as any[]
  };

  // AI Insights Endpoint
  app.post('/api/ai/insights', async (req, res) => {
    try {
      const { attendanceData } = req.body;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `
          As a School Attendance AI Assistant, analyze this attendance data:
          ${JSON.stringify(attendanceData)}
          
          Provide 3 concise, high-impact "Smart Insights" for the school principal.
          Focus on:
          1. Attendance patterns (e.g. "Lateness increases on Mondays").
          2. Students at risk of chronic absenteeism.
          3. A positive highlight.
          
          Format as a JSON array of strings. No markdown formatting.
        `,
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "[]";
      res.json(JSON.parse(text));
    } catch (error) {
      console.error("AI Insight Error:", error);
      res.status(500).json(["Pattern analysis temporarily unavailable", "System monitoring active", "Attendance tracking steady"]);
    }
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/schools', (req, res) => {
    res.json(db.schools);
  });

  app.post('/api/attendance/sync', (req, res) => {
    const { records } = req.body;
    console.log(`Syncing ${records.length} records...`);
    
    // Add to our "database"
    db.attendance.push(...records);
    
    res.json({ 
      success: true, 
      syncedCount: records.length,
      timestamp: new Date().toISOString() 
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `<!DOCTYPE html><html><head></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
