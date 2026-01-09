import { useState } from "react";

interface InputSectionProps {
  onParseText: (text: string) => void;
}

export default function InputSection({ onParseText }: InputSectionProps) {
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"paste" | "manual">("paste");

  const handlePaste = () => {
    if (inputText.trim()) {
      onParseText(inputText);
      setInputText("");
    }
  };

  const handleManualAdd = () => {
    if (inputText.trim()) {
      onParseText(inputText);
      setInputText("");
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Player Input</h2>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("paste")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "paste"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "manual"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Manual Entry
        </button>
      </div>

      {activeTab === "paste" && (
        <div className="space-y-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste player list here...&#10;&#10;Format examples:&#10;7 Ivan Horvat&#10;A Ivan Horvat (delegate)&#10;Ivan Horvat (7)&#10;Ivan Horvat (A)&#10;7h Ivan Horvat&#10;Ivan Horvat - 7&#10;Ivan Horvat - A"
            className="w-full h-40 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          <button
            onClick={handlePaste}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Parse and Add
          </button>
        </div>
      )}

      {activeTab === "manual" && (
        <div className="space-y-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleManualAdd();
              }
            }}
            placeholder="Enter player (e.g. 7 Ivan Horvat or A Ivan Horvat)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleManualAdd}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Add Player
          </button>
        </div>
      )}
    </div>
  );
}
