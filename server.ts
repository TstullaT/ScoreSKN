import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ParsedMatch {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
  venue?: string;
  matchweek?: string;
  homeScore?: number;
  awayScore?: number;
}

const KNOWN_TEAMS = [
  "Rams Village Superstars",
  "Development Bank St. Peters",
  "MFCR United Old Road Jets",
  "Honda Newtown United",
  "S L Horsford St. Pauls United",
  "Azul Cayon Rockets",
  "SOL Island Auto Conaree",
  "TGE Dieppe Bay Eagles",
  "607 Construction Lodge Patriots",
  "SKELEC Garden Hotspurs",
  "Bath United",
  "St. Kitts Concrete Masters Sandy Point",
  "St. Peters FC",
  "Old Road United Jets",
  "Newtown United",
  "St. Paul's United",
  "Village Superstars",
  "Cayon Rockets",
  "Conaree FC",
  "Dieppe Bay Eagles",
  "Lodge Patriots",
  "Garden Hotspurs"
];

function extractMatchesFromText(rawText: string): ParsedMatch[] {
  const matches: ParsedMatch[] = [];
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  let currentMatchweek = "";
  let currentDate = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect matchweek / round headers
    const mwMatch = line.match(/(?:matchweek|match\s*week|round|week)\s*([0-9]+)/i);
    if (mwMatch) {
      currentMatchweek = `Matchweek ${mwMatch[1]}`;
      continue;
    }

    // Detect date lines (e.g. Friday 4 Sept, 04/09/2026, Sept 14, 2026)
    const datePattern = /(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s*)?(?:(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s*(?:\d{4})?|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s*(?:\d{4})?)/i;
    
    // Check if line contains time (e.g. 4:00 PM, 19:00, 6:00PM, 8:15 PM)
    const timeMatch = line.match(/\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\b/);

    // Check for "vs" or " v " or standard team delimiters
    const vsMatch = line.match(/(.+?)\s+(?:vs\.?|v\.?|-)\s+(.+)/i);

    let home = "";
    let away = "";
    let time = timeMatch ? timeMatch[1] : "TBD";
    let venue = "";

    if (line.toLowerCase().includes("technical center") || line.toLowerCase().includes("tech c")) {
      venue = "NBG Technical Center";
    } else if (line.toLowerCase().includes("warner park")) {
      venue = "Warner Park";
    }

    if (vsMatch) {
      home = vsMatch[1].replace(datePattern, "").replace(timeMatch ? timeMatch[0] : "", "").trim();
      away = vsMatch[2].replace(timeMatch ? timeMatch[0] : "", "").trim();
      // clean venue from away if attached
      if (venue && away.includes(venue)) {
        away = away.replace(venue, "").trim();
      }
    } else {
      // Check if two known teams appear in the line
      const foundTeams: string[] = [];
      for (const team of KNOWN_TEAMS) {
        if (line.toLowerCase().includes(team.toLowerCase())) {
          if (!foundTeams.some(t => t.toLowerCase().includes(team.toLowerCase()) || team.toLowerCase().includes(t.toLowerCase()))) {
            foundTeams.push(team);
          }
        }
      }
      if (foundTeams.length >= 2) {
        home = foundTeams[0];
        away = foundTeams[1];
      }
    }

    // Check date in line or previous date line
    const inlineDateMatch = line.match(datePattern);
    if (inlineDateMatch) {
      currentDate = inlineDateMatch[0].trim();
    }

    // Check scores e.g. "3 - 1" or "3-1" (remove time string first so times like 7:00 PM are never parsed as scores)
    let homeScore: number | undefined;
    let awayScore: number | undefined;
    const cleanLineForScore = timeMatch ? line.replace(timeMatch[0], "") : line;
    const scoreMatch = cleanLineForScore.match(/\b(\d+)\s*[-–]\s*(\d+)\b/);
    if (scoreMatch) {
      homeScore = parseInt(scoreMatch[1]);
      awayScore = parseInt(scoreMatch[2]);
    }

    if (home && away) {
      // Clean score numbers from team names if attached
      if (homeScore !== undefined) {
        home = home.replace(new RegExp(`\\s*${homeScore}\\s*$`), "").trim();
      }
      if (awayScore !== undefined) {
        away = away.replace(new RegExp(`^\\s*${awayScore}\\s*`), "").trim();
      }

      matches.push({
        id: `pdf-match-${matches.length + 1}`,
        home: home.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9.]+$/g, "").trim(),
        away: away.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9.]+$/g, "").trim(),
        date: currentDate || "TBD",
        time: time,
        venue: venue || "NBG Technical Center",
        matchweek: currentMatchweek || undefined,
        homeScore,
        awayScore
      });
    }
  }

  return matches;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const publicPath = path.resolve(__dirname, "public");

  // Global CORS and security headers for PWABuilder, Lighthouse, and TWA verification
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Explicit PWA Manifest serving with compliant MIME type and CORS
  app.get(["/manifest.json", "/manifest.webmanifest"], (req, res) => {
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "manifest.json"));
  });

  // Service Worker route with Service-Worker-Allowed root scope
  app.get("/sw.js", (req, res) => {
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Service-Worker-Allowed", "/");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "sw.js"));
  });

  // Digital Asset Links for Google Play Store Trusted Web Activity (TWA)
  app.get("/.well-known/assetlinks.json", (req, res) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, ".well-known", "assetlinks.json"));
  });

  // Direct download endpoints for PWA Builder & manual uploads
  app.get("/download/manifest.json", (req, res) => {
    res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="manifest.json"');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "manifest.json"));
  });

  app.get("/download/icon-192.png", (req, res) => {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="scoreskn-192x192.png"');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "pwa-192x192.png"));
  });

  app.get("/download/icon-512.png", (req, res) => {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="scoreskn-512x512.png"');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "pwa-512x512.png"));
  });

  app.get("/download/icon-maskable-512.png", (req, res) => {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="scoreskn-maskable-512x512.png"');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "pwa-maskable-512x512.png"));
  });

  app.get("/download/icon-1024.png", (req, res) => {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="scoreskn-1024x1024.png"');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "pwa-1024x1024.png"));
  });

  app.get("/download/icon-maskable-1024.png", (req, res) => {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="scoreskn-maskable-1024x1024.png"');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(path.join(publicPath, "pwa-maskable-1024x1024.png"));
  });

  // Serve static files from public with CORS
  app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (filePath.endsWith(".json")) {
        res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
      }
    }
  }));

  app.use(express.json({ limit: "50mb" }));
  app.use(express.raw({ type: ["application/pdf", "application/octet-stream"], limit: "50mb" }));

  // API Proxy for CSV with redirects follow
  app.get("/api/proxy-csv", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send("URL is required");
    }

    try {
      console.log(`Proxying CSV from: ${url}`);
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      const data = await response.text();
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(data);
    } catch (error) {
      console.error("Proxy Error:", error);
      res.status(500).send("Failed to fetch CSV");
    }
  });

  // API to parse uploaded Fixture PDF
  app.post("/api/parse-fixture-pdf", async (req, res) => {
    try {
      let buffer: Buffer;

      if (Buffer.isBuffer(req.body)) {
        buffer = req.body;
      } else if (req.body?.base64) {
        buffer = Buffer.from(req.body.base64, "base64");
      } else if (req.body?.text) {
        const matches = extractMatchesFromText(req.body.text);
        return res.json({ success: true, text: req.body.text, matches });
      } else {
        return res.status(400).json({ error: "No PDF buffer or text received" });
      }

      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      const rawText = typeof textResult === "string" ? textResult : (textResult as any)?.text || "";
      const matches = extractMatchesFromText(rawText);

      return res.json({
        success: true,
        rawTextLength: rawText.length,
        rawTextSnippet: rawText.substring(0, 1000),
        matchesCount: matches.length,
        matches
      });
    } catch (err: any) {
      console.error("PDF Parsing Error:", err);
      return res.status(500).json({ error: err.message || "Failed to parse PDF" });
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
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const DEV_PORT = 3000;
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;

  app.listen(DEV_PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${DEV_PORT}`);
  });

  if (envPort && envPort !== DEV_PORT && !isNaN(envPort)) {
    try {
      app.listen(envPort, "0.0.0.0", () => {
        console.log(`Cloud Run server also listening on http://0.0.0.0:${envPort}`);
      });
    } catch (e) {
      console.warn("Could not bind additional port:", e);
    }
  }
}

startServer();

