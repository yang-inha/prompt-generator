// pages/api/generate.ts

import type { NextApiRequest, NextApiResponse } from "next";

const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userInput, clarificationAnswer } = req.body;

  const prompt = clarificationAnswer
    ? `${userInput}\n추가 정보: ${clarificationAnswer}`
    : userInput;

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `다음 요청을 가장 전문적인 프롬프트로 만들어줘: ${prompt}` }]
            }
          ]
        })
      }
    );

    const result = await geminiResponse.json();
    console.log("🔍 Gemini 응답:", result);

    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "응답이 없습니다";

    // 예시: Clarifying Question을 포함하고 싶다면 여기서 파싱
    res.status(200).json({
      clarifyingQuestion: "", // 향후 개선 가능
      finalPrompt: text
    });
  } catch (error) {
    console.error("❌ Gemini 호출 오류:", error);
    res.status(500).json({ error: "Gemini API 호출 실패" });
  }
}
