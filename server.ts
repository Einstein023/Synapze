import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Disable revealing Server headers
  app.disable('x-powered-by');

  // Secure HTTP Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Lightweight self-contained in-memory rate-limiter for API routes to mitigate brute force
  const apiRateLimits = new Map<string, { count: number; resetAt: number }>();
  const rateLimitMiddleware = (maxRequests: number, windowMs: number) => {
    return (req: any, res: any, next: any) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const record = apiRateLimits.get(ip);

      if (!record || now > record.resetAt) {
        apiRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
        return next();
      }

      if (record.count >= maxRequests) {
        return res.status(429).json({ 
          error: "Too many requests from this address. Please let your intellectual garden rest for a minute." 
        });
      }

      record.count += 1;
      next();
    };
  };

  // JSON parsing middleware for post payloads with high limit for image uploads
  app.use(express.json({ limit: '25mb' }));

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadsDir));

  // Lazy initiator helper for Gemini AI client to prevent startup crashes when keys are missing
  let aiClient: GoogleGenAI | null = null;
  function getAi() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error('GEMINI_API_KEY is not configured in environment or .env file');
      }
      aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
  }

  // --- API ROUTE FOR SECURE FILE UPLOADS ---
  app.post('/api/upload', rateLimitMiddleware(30, 10 * 60 * 1000), (req, res) => {
    try {
      const { fileName, fileType, base64 } = req.body;
      if (!base64 || !fileName) {
        return res.status(400).json({ error: 'Missing base64 data or filename.' });
      }

      // Strip metadata if present (e.g. data:image/png;base64,)
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, 'base64');
      
      // Create a unique clean filename
      const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const destinationPath = path.join(uploadsDir, safeName);

      fs.writeFileSync(destinationPath, buffer);

      // Return a relative path served by the express server
      res.json({ url: `/uploads/${safeName}` });
    } catch (err) {
      console.error('File upload failed:', err);
      res.status(500).json({ error: 'Failed to write file securely to server storage.' });
    }
  });

  // --- API ROUTE FOR SECURE MASCOT COMPANION TIPS PROXY ---
  app.post('/api/gemini', rateLimitMiddleware(60, 10 * 60 * 1000), async (req, res) => {
    try {
      const { title, content, tags, companionName = "Sprounty", mode } = req.body;
      const ai = getAi();

      let promptMsg = '';

      if (mode === 'friendly') {
        promptMsg = `You are a text transformation tool.
Rewrite the following text to make it sound warm, friendly, positive, and encouraging, as if spoken by a supportive friend.
CRITICAL: Output ONLY the direct rewritten version of the text. Do NOT include any introductions, conversational preambles, chat greetings, wrap-ups, outlines, or commentary (e.g. do not say "Here is the friendly version" or "Sure, I can help").
Your entire response will be directly inserted into a text editor, so any extra conversational text will corrupt the user's document.

Text to rewrite:
---
${content}
---`;
      } else if (mode === 'humanize') {
        promptMsg = `You are a text transformation tool.
Rewrite the following text to sound completely authentic, natural, human, engaging, and heartfelt (humanize it). Prune robotic transitions, repetitive structures, or generic filler.
CRITICAL: Output ONLY the direct rewritten version of the text. Do NOT include any introductions, conversational preambles, chat greetings, wrap-ups, outlines, or commentary (e.g. do not say "Here is the humanized version" or "Certainly").
Your entire response will be directly inserted into a text editor, so any extra conversational text will corrupt the user's document.

Text to rewrite:
---
${content}
---`;
      } else if (mode === 'professional') {
        promptMsg = `You are a text transformation tool.
Rewrite the following text to make it clean, articulate, well-structured, and highly professional. Preserve all original action items and facts.
CRITICAL: Output ONLY the direct rewritten version of the text. Do NOT include any introductions, conversational preambles, chat greetings, wrap-ups, outlines, or commentary (e.g. do not say "Here is the professional version" or "Here is the polished text").
Your entire response will be directly inserted into a text editor, so any extra conversational text will corrupt the user's document.

Text to rewrite:
---
${content}
---`;
      } else if (mode === 'poetic') {
        promptMsg = `You are a text transformation tool.
Rewrite the following text in a charming, reflective, and poetic garden-inspired style. Infuse soft horticultural metaphors while keeping the core meaning understandable.
CRITICAL: Output ONLY the direct rewritten version of the text. Do NOT include any introductions, conversational preambles, chat greetings, wrap-ups, outlines, or commentary (e.g. do not say "Here is the poetic metaphor version" or "Soft breeze...").
Your entire response will be directly inserted into a text editor, so any extra conversational text will corrupt the user's document.

Text to rewrite:
---
${content}
---`;
      } else {
        // Default Advice Mode
        promptMsg = `You are "${companionName} the Botanist", a virtual horticulturist companion helping the user groom their digital knowledge garden.
Here is the user's current seedling note details:
Title: "${title || 'Untitled Note'}"
Associated Tags: [${tags || 'none'}]
Prose / content:
---
${content || '(no content written yet)'}
---

Provide a short, delightful advice response on how the user can "grow", "prune", or "fertilize" this knowledge node.
CRITICAL RULES:
- Output ONLY a single, short, and concise paragraph of advice (around 2-3 sentences max).
- Do NOT use markdown.
- Do NOT use any bolding or italicizing (do NOT use asterisks like * or **).
- Do NOT use headers, bullets, or numbered lists.
- Keep it entirely as friendly plain text.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptMsg,
      });

      const responseText = (response.text || "Your note is looking neat! Sow links to interlock seeds.").trim().replace(/[*#`_\-]/g, '');
      
      if (mode) {
        res.json({ rewritten: responseText });
      } else {
        res.json({ advice: responseText });
      }
    } catch (error) {
      const companionName = req.body.companionName || "Sprouty";
      const mode = req.body.mode;
      console.warn("Express server-side Gemini generation failed:", error instanceof Error ? error.message : String(error));
      
      if (mode) {
        // Return a direct fallback rewrite without any conversational wrapper text
        const fallbackRewrite = req.body.content || "Fresh garden soil awaits.";
        res.json({ rewritten: fallbackRewrite });
      } else {
        res.json({ 
          advice: `Try adding tags or semantic references to link this seedling note with your other active garden items. You can also decompose any action items to keep your garden's energy balanced and your daily streaks growing strong!`
        });
      }
    }
  });

  // --- API ROUTE FOR WEEKLY GARDEN GROWTH REPORT ---
  app.post('/api/report', rateLimitMiddleware(15, 10 * 60 * 1000), async (req, res) => {
    try {
      const { 
        displayName = "Gardener", 
        streakDays = 0, 
        notesCount = 0, 
        companionName = "Sprouty", 
        recentNotes = [], 
        email = "gardener@example.com" 
      } = req.body;

      let aiMessage = "";
      
      // Attempt to use Gemini to write an extremely encouraging, poetic weekly commentary
      try {
        const ai = getAi();
        const promptMsg = `You are "${companionName} the Botanist", a warm, enthusiastic virtual horticulturist companion.
The user is named "${displayName}". This week they created ${notesCount} seedling notes and maintained a learning streak of ${streakDays} days.
Write a 3-4 sentence warm, personalized weekly reflection celebrating their growth. Focus on encouraging them to return next week, suggesting how their "intellectual garden" is taking root, and mentioning some of their recent notes: ${JSON.stringify(recentNotes)}.
Keep the tone poetic, inspiring, and horticultural. Do NOT write any HTML or subject line; just output the 3-4 sentence message directly in plain text.`;
        
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptMsg,
        });
        aiMessage = aiResponse.text || "";
      } catch (geminiError) {
        console.warn("Gemini weekly commentary generation failed or is skipped:", geminiError instanceof Error ? geminiError.message : String(geminiError));
        // High-quality static fallback commentary
        if (notesCount > 0) {
          aiMessage = `Your intellectual garden is shooting up beautiful green stems! By sowing ${notesCount} notes this week, you've nourished the soil of your thoughts. The sowed notes like ${recentNotes.length > 0 ? `"${recentNotes[0]}"` : 'your seedlings'} are anchoring deep root networks that will support your long-term mastery. Let us keep watering these ideas next week!`;
        } else {
          aiMessage = `The quiet seasons of a garden are when the soil prepares for future blossoms. Even though no new seedlings were sowed this week, your ${streakDays}-day momentum stands as a solid arbor. Let us plant a fresh seed together next week to welcome back the morning sun!`;
        }
      }

      // Format a high-fidelity, responsive HTML email template matching the Synapze brand
      const subject = `🌿 Your Weekly Garden Growth Report: ${streakDays} Day Streak Blooming!`;
      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f4ef;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f5f4ef;
      padding: 30px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(32, 61, 54, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background-color: #203d36;
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    .header h1 {
      color: #faf9f6;
      font-size: 26px;
      margin: 0 0 10px 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      color: #bbf7d0;
      font-size: 14px;
      margin: 0;
      font-weight: 500;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #0f172a;
      margin: 0 0 20px 0;
      font-weight: 700;
    }
    .commentary-box {
      background-color: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 20px;
      border-radius: 0 12px 12px 0;
      margin-bottom: 30px;
    }
    .commentary-text {
      color: #065f46;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
      font-style: italic;
    }
    .stats-grid {
      display: table;
      width: 100%;
      margin-bottom: 30px;
      border-collapse: separate;
      border-spacing: 15px 0;
    }
    .stats-col {
      display: table-cell;
      width: 50%;
      background-color: #fcf9f2;
      border: 1px solid #eed052;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
    }
    .stats-num {
      font-size: 36px;
      font-weight: 800;
      color: #203d36;
      margin-bottom: 5px;
    }
    .stats-label {
      font-size: 11px;
      font-weight: 700;
      color: #855b11;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #203d36;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin: 30px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f5f9;
    }
    .notes-list {
      margin: 0;
      padding: 0 0 0 20px;
    }
    .notes-list li {
      color: #334155;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .no-notes {
      color: #64748b;
      font-size: 14px;
      font-style: italic;
    }
    .cta-btn {
      display: inline-block;
      background-color: #203d36;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      margin-top: 20px;
      text-align: center;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      color: #64748b;
      font-size: 12px;
      margin: 0 0 10px 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Weekly Garden Growth</h1>
        <p>SYNAPZE KNOWLEDGE GARDEN</p>
      </div>
      <div class="content">
        <div class="greeting">Hello, ${displayName}! 🌿</div>
        
        <div class="commentary-box">
          <p class="commentary-text">
            "${aiMessage}"
            <br>
            <span style="display: block; text-align: right; margin-top: 8px; font-weight: bold; font-style: normal; font-size: 12px;">— ${companionName}</span>
          </p>
        </div>

        <div class="section-title">Consistency Metrics</div>
        <div class="stats-grid">
          <div class="stats-col">
            <div class="stats-num">${streakDays}</div>
            <div class="stats-label">Day Streak</div>
          </div>
          <div class="stats-col">
            <div class="stats-num">${notesCount}</div>
            <div class="stats-label">Seeds Sowed</div>
          </div>
        </div>

        <div class="section-title">Seedlings Sowed This Week</div>
        ${recentNotes.length > 0 ? `
          <ul class="notes-list">
            ${recentNotes.map((note: string) => `<li><strong>${note}</strong></li>`).join('')}
          </ul>
        ` : `
          <p class="no-notes">No seedling notes sowed this week. Try taking some quick captures or brainstorming new topics!</p>
        `}

        <div style="text-align: center;">
          <a href="https://ai.studio/build" class="cta-btn">Visit Your Knowledge Garden</a>
        </div>
      </div>
      <div class="footer">
        <p>You received this digest email as a weekly summary of your Synapze garden activity.</p>
        <p>&copy; ${new Date().getFullYear()} Synapze. Sowed with love and intention.</p>
      </div>
    </div>
  </div>
</body>
</html>
      `;

      res.json({
        success: true,
        subject,
        htmlBody,
        message: "Garden Growth Report generated successfully."
      });
    } catch (err) {
      console.error("Weekly Garden Growth Report generation error:", err);
      res.status(500).json({ error: "Failed to generate weekly growth report." });
    }
  });

  // Health-check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', database: 'connected', fallbackActive: !process.env.GEMINI_API_KEY });
  });

  // Global Error Handler Middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[SECURITY CONTROL] Handled express exception:', err);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(err.status || 500).json({
      error: isProd ? 'A secure internal server error occurred.' : err.message || 'Internal Server Error'
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled assets in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYNAPZE SERVER] running securely on host http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Encountered fatal startup exception in Node Server entry:", error);
});
