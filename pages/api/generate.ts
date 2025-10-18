// pages/api/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Method 체크
  if (req.method !== "POST") {
    return res.status(405).json({ 
      clarifyingQuestion: "",
      finalPrompt: "POST 요청만 허용됩니다." 
    });
  }

  // 2. API 키 체크
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log("🔑 API Key exists:", !!apiKey);
  console.log("🔑 API Key prefix:", apiKey?.substring(0, 10));

  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY가 설정되지 않았습니다!");
    return res.status(500).json({
      clarifyingQuestion: "",
      finalPrompt: "API 키가 설정되지 않았습니다. 환경변수를 확인해주세요."
    });
  }

  // 3. Request body 체크
  const { userInput, clarificationAnswer } = req.body;
  console.log("📝 User Input:", userInput);
  console.log("📝 Clarification Answer:", clarificationAnswer);

  if (!userInput) {
    return res.status(400).json({
      clarifyingQuestion: "",
      finalPrompt: "입력값이 필요합니다."
    });
  }

  const prompt = clarificationAnswer
    ? `${userInput}\n추가 정보: ${clarificationAnswer}`
    : userInput;

  try {
    console.log("🚀 Claude API 호출 시작...");
    
    // 4. Claude API 호출
    const claudeResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
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

    console.log("📊 Response Status:", claudeResponse.status);
    console.log("📊 Response OK:", claudeResponse.ok);

    // 5. 응답 체크
    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error("❌ Claude API 에러:", errorText);
      return res.status(500).json({
        clarifyingQuestion: "",
        finalPrompt: `API 호출 실패 (${claudeResponse.status}): ${errorText.substring(0, 100)}`
      });
    }

    const result = await claudeResponse.json();
    console.log("✅ Claude 응답 수신:", JSON.stringify(result).substring(0, 200));

    const text = result?.content?.[0]?.text;
    
    if (!text) {
      console.error("❌ 응답에 텍스트가 없습니다:", result);
      return res.status(500).json({
        clarifyingQuestion: "",
        finalPrompt: "Claude로부터 유효한 응답을 받지 못했습니다."
      });
    }

    console.log("🎉 성공! 프롬프트 길이:", text.length);

    // 6. 성공 응답
    return res.status(200).json({
      clarifyingQuestion: "",
      finalPrompt: text
    });

} catch (error) {
    console.error("❌ 예외 발생:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("❌ 에러 메시지:", errorMessage);
    console.error("❌ 에러 스택:", errorStack);
    
    return res.status(500).json({
      clarifyingQuestion: "",
      finalPrompt: `오류 발생: ${errorMessage}`
    });
  }
}
