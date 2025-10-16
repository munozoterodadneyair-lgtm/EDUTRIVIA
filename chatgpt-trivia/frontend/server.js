import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // permite que tu HTML pueda llamar a la API desde el navegador

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint para responder y crear trivia
app.post("/api/preguntar", async (req, res) => {
  const { pregunta } = req.body;

  try {
    // 1️⃣ Respuesta general
    const respuesta = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un asistente educativo." },
        { role: "user", content: pregunta },
      ],
    });

    const textoRespuesta = respuesta.choices[0].message.content;

    // 2️⃣ Trivia basada en esa respuesta
    const trivia = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Genera una trivia en formato JSON con los campos 'pregunta', 'opciones' (array con 4), y 'correcta'.",
        },
        { role: "user", content: textoRespuesta },
      ],
    });

    const triviaJSON = JSON.parse(trivia.choices[0].message.content);

    res.json({
      respuesta: textoRespuesta,
      trivia: triviaJSON,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener respuesta del modelo." });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor API corriendo en http://localhost:3000");
});
