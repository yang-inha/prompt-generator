// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";

const apiKey = process.env.ANTHROPIC_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userInput, clarificationAnswer } = req.body;

  const prompt = clarificationAnswer
    ? `${userInput}\n추가 정보: ${clarificationAnswer}`
    : userInput;

  try {
    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2048,
          messages: [
            {
              role: "user",
              content: `당신은 프롬프트 엔지니어링 전문가입니다. 사용자의 요청을 분석하고 더 효과적인 프롬프트로 개선해주세요.

사용자 요청: ${prompt}

다음 형식으로 응답해주세요:
1. 명확하고 구체적인 프롬프트
2. 목표와 맥락이 잘 드러나도록
3. AI가 이해하기 쉽게 구조화

개선된 프롬프트만 작성해주세요.`,
            },
          ],
        }),
      }
    );

    const result = await claudeResponse.json();
    console.log("🤖 Claude 응답:", result);

    const text = result?.content?.[0]?.text || "프롬프트를 생성할 수 없습니다.";

    res.status(200).json({
      clarifyingQuestion: "",
      finalPrompt: text
    });

  } catch (error) {
    console.error("❌ Claude API 오류:", error);
    res.status(500).json({ 
      clarifyingQuestion: "",
      finalPrompt: "API 오류가 발생했습니다. ANTHROPIC_API_KEY를 확인해주세요." 
    });
  }
}
