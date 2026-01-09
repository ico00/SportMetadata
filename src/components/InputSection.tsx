import { useState } from "react";
import { FaPaste, FaKeyboard, FaCheck, FaPlus } from "react-icons/fa";

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
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 animate-slide-up">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaKeyboard className="text-indigo-400" />
        Player Input
      </h2>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("paste")}
          className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
            activeTab === "paste"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:scale-105"
          }`}
        >
          <FaPaste className="text-sm" />
          Paste Text
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
            activeTab === "manual"
              ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:scale-105"
          }`}
        >
          <FaKeyboard className="text-sm" />
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
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
          >
            <FaCheck />
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
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
          >
            <FaPlus />
            Add Player
          </button>
        </div>
      )}
    </div>
  );
}
