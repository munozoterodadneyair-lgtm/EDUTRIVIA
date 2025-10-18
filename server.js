import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.post("/api/preguntar", async (req, res) => {
  const { pregunta } = req.body;
  if (!pregunta) return res.status(400).json({ error: "Falta la pregunta" });

  try {
 
    const respuestaRaw = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un profesor experto que da respuestas educativas y claras." },
          { role: "user", content: pregunta },
        ],
      }),
    });

    const respuestaData = await respuestaRaw.json();
    const respuestaTexto = respuestaData.choices[0].message.content.trim();

 
    const triviaRaw = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Genera una trivia en formato JSON." },
          {
            role: "user",
            content: `Crea una trivia de una sola pregunta basada en el siguiente texto educativo:
            
            "${respuestaTexto}"
            
            Devuélvela en formato JSON con esta estructura exacta:
            {
              "pregunta": "texto",
              "opciones": ["A","B","C","D"],
              "correcta": "texto de la opción correcta"
            }`
          }
        ],
      }),
    });

    const triviaData = await triviaRaw.json();
    const triviaJson = JSON.parse(triviaData.choices[0].message.content);

    res.json({
      respuesta: respuestaTexto,
      trivia: triviaJson,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando respuesta o trivia" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor activo en http://localhost:${PORT}`));
