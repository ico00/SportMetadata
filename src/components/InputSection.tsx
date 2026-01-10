import { useState, useRef } from "react";
import { FaPaste, FaKeyboard, FaCheck, FaPlus, FaFilePdf, FaSpinner } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { parsePDFForPlayers } from "../utils/pdfParser";

interface InputSectionProps {
  onParseText: (text: string) => void;
}

export default function InputSection({ onParseText }: InputSectionProps) {
  const { isAuthenticated } = useAuth();
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"paste" | "manual" | "pdf">("paste");
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hide input section if not authenticated
  if (!isAuthenticated) {
    return null;
  }

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

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Molimo odaberite PDF datoteku!');
      return;
    }

    setIsProcessingPDF(true);
    setPdfFileName(file.name);

    try {
      const extractedText = await parsePDFForPlayers(file);
      
      if (!extractedText.trim()) {
        alert('Nije moguće izvući tekst iz PDF datoteke. Molimo provjerite da li je PDF ispravan.');
        setIsProcessingPDF(false);
        setPdfFileName(null);
        return;
      }

      // Automatski parsiraj i dodaj igrače
      onParseText(extractedText);
      
      // Resetuj file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setPdfFileName(null);
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert(`Greška pri obradi PDF datoteke: ${error instanceof Error ? error.message : 'Nepoznata greška'}`);
      setPdfFileName(null);
    } finally {
      setIsProcessingPDF(false);
    }
  };

  const handlePDFButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-6 shadow-2xl border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300 animate-slide-up backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-transparent transition-all duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
            <FaKeyboard className="text-2xl text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Player Input
          </h2>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("paste")}
            className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold border ${
              activeTab === "paste"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl scale-105 border-blue-400/30"
                : "bg-gradient-to-r from-gray-700 to-gray-700/80 text-gray-300 hover:from-gray-600 hover:to-gray-600/80 shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-600/50"
            }`}
          >
            <FaPaste className="text-sm" />
            Paste Text
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold border ${
              activeTab === "manual"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl scale-105 border-blue-400/30"
                : "bg-gradient-to-r from-gray-700 to-gray-700/80 text-gray-300 hover:from-gray-600 hover:to-gray-600/80 shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-600/50"
            }`}
          >
            <FaKeyboard className="text-sm" />
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab("pdf")}
            className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold border ${
              activeTab === "pdf"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl scale-105 border-blue-400/30"
                : "bg-gradient-to-r from-gray-700 to-gray-700/80 text-gray-300 hover:from-gray-600 hover:to-gray-600/80 shadow-lg hover:shadow-xl transform hover:scale-105 border-gray-600/50"
            }`}
          >
            <FaFilePdf className="text-sm" />
            Upload PDF
          </button>
        </div>

        {activeTab === "paste" && (
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste player list here...&#10;&#10;Format examples:&#10;7 Ivan Horvat&#10;A Ivan Horvat (delegate)&#10;Ivan Horvat (7)&#10;Ivan Horvat (A)&#10;7h Ivan Horvat&#10;Ivan Horvat - 7&#10;Ivan Horvat - A"
              className="w-full h-40 px-4 py-3 bg-gradient-to-br from-gray-700/80 to-gray-800/80 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 font-mono text-sm text-gray-200 placeholder-gray-500 shadow-inner backdrop-blur-sm transition-all duration-200"
            />
            <button
              onClick={handlePaste}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] font-bold text-lg border border-green-400/30"
            >
              <FaCheck className="text-lg" />
              Parse and Add
            </button>
          </div>
        )}

        {activeTab === "manual" && (
          <div className="space-y-4">
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
              className="w-full px-4 py-3 bg-gradient-to-r from-gray-700/80 to-gray-800/80 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 text-gray-200 placeholder-gray-500 shadow-inner backdrop-blur-sm transition-all duration-200"
            />
            <button
              onClick={handleManualAdd}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] font-bold text-lg border border-green-400/30"
            >
              <FaPlus className="text-lg" />
              Add Player
            </button>
          </div>
        )}

        {activeTab === "pdf" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handlePDFUpload}
              className="hidden"
              disabled={isProcessingPDF}
            />
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-all duration-200 bg-gray-700/30">
              {isProcessingPDF ? (
                <div className="flex flex-col items-center gap-4">
                  <FaSpinner className="text-4xl text-indigo-400 animate-spin" />
                  <div className="text-gray-300">
                    <p className="font-semibold">Obrađujem PDF...</p>
                    {pdfFileName && (
                      <p className="text-sm text-gray-400 mt-1">{pdfFileName}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <FaFilePdf className="text-5xl text-red-400" />
                  <div className="text-gray-300">
                    <p className="font-semibold mb-2">Kliknite za odabir PDF datoteke</p>
                    <p className="text-sm text-gray-400">
                      Aplikacija će automatski izvući popis igrača iz PDF-a
                    </p>
                  </div>
                  <button
                    onClick={handlePDFButtonClick}
                    disabled={isProcessingPDF}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold border border-indigo-400/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <FaFilePdf className="text-lg" />
                    Odaberi PDF datoteku
                  </button>
                </div>
              )}
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-200">
              <p className="font-semibold mb-2">💡 Savjet:</p>
              <p className="text-blue-300/90">
                PDF bi trebao sadržavati popis igrača u jednom od podržanih formata:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-blue-300/80 ml-2">
                <li>7 Ivan Horvat</li>
                <li>A Ivan Horvat</li>
                <li>Ivan Horvat (7)</li>
                <li>Ivan Horvat - 7</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
