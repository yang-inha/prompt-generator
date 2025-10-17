import { useState } from "react";

export default function PromptGenerator() {
  const [userInput, setUserInput] = useState("");
  const [clarifyingQuestion, setClarifyingQuestion] = useState("");
  const [clarificationAnswer, setClarificationAnswer] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePrompt = async () => {
    setLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput, clarificationAnswer })
    });
    const data = await response.json();
    setClarifyingQuestion(data.clarifyingQuestion || "");
    setFinalPrompt(data.finalPrompt || "");
    setLoading(false);
  };


  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🧠 레벨업 프롬프트 생성기</h1>
      <p className="text-sm text-gray-600">
<strong>이 프롬프트는 프롬프트 초보자를 위한 것입니다.</strong>
</p>
<p className="text-sm text-gray-600">
이 프롬프트에 당신이 생각한 대략적인 지시문을 작성해보세요.
</p>
<p className="text-sm text-gray-600">
그럼 전문적인 프롬프트를 제시해 줄 겁니다.
</p>
<p className="text-sm text-gray-600">
제시한 프롬프트를 복사해서 챗지피티, 제미나이, 클로드 등에 활용하시면 됩니다.
</p>
      <textarea
        placeholder="원하는 작업을 입력하세요 (예: 유튜브 영상 제목 생성 프롬프트)"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        rows={4}
      />

      {clarifyingQuestion && (
        <div className="mb-4">
          <p className="font-semibold">🤖 추가 질문: {clarifyingQuestion}</p>
          <textarea
            placeholder="여기에 답변하세요"
            value={clarificationAnswer}
            onChange={(e) => setClarificationAnswer(e.target.value)}
            className="w-full p-2 border rounded mt-2"
            rows={3}
          />
        </div>
      )}

      <button
        onClick={generatePrompt}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "생성 중..." : "프롬프트 생성하기"}
      </button>

      {finalPrompt && (
        <div className="mt-6 border rounded p-4 bg-gray-100">
          <p className="text-sm text-black dark:text-white mb-2">🎯 생성된 프롬프트:</p>
          <textarea value={finalPrompt} readOnly className="w-full p-2 mb-2 text-black dark:text-white" rows={10} />

          <button
            onClick={copyToClipboard}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            📋 복사하기
          </button>
        </div>
      )}
    </div>
  );
}
