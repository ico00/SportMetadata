import { Match, Team } from "../types";
import { formatForShutterstock, formatForShutterstockEditorial, formatForImago } from "../utils/stockAgencies";
import { FaCopy, FaImage, FaCheck, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface StockAgenciesPanelProps {
  match: Match | null;
  teams?: Team[];
}

export default function StockAgenciesPanel({ match, teams = [] }: StockAgenciesPanelProps) {
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});

  if (!match) {
    return null;
  }

  const shutterstockText = formatForShutterstock(match);
  const shutterstockEditorialText = formatForShutterstockEditorial(match, teams);
  const imagoText = formatForImago(match);

  // Get current text (edited or original)
  const getText = (key: string, originalText: string): string => {
    return editedTexts[key] !== undefined ? editedTexts[key] : originalText;
  };

  const handleEdit = (key: string, originalText: string) => {
    setEditing(key);
    if (editedTexts[key] === undefined) {
      setEditedTexts({ ...editedTexts, [key]: originalText });
    }
  };

  const handleSave = (_key: string) => {
    setEditing(null);
  };

  const handleCancel = (key: string, _originalText: string) => {
    setEditing(null);
    const newEditedTexts = { ...editedTexts };
    delete newEditedTexts[key];
    setEditedTexts(newEditedTexts);
  };

  const copyToClipboard = (text: string, agencyKey: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(agencyKey);
      setTimeout(() => setCopied(null), 2000);
    }).catch((err) => {
      alert(`Failed to copy: ${err}`);
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl border border-gray-700 hover:border-pink-500/50 transition-all duration-300 animate-slide-up">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FaImage className="text-pink-400" />
        Stock Agencies Format
      </h2>

      <div className="space-y-4">
        {/* Shutterstock */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-3 border border-gray-600 hover:border-blue-500/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-400 flex items-center gap-2">
              <FaImage className="text-blue-400" />
              Shutterstock
            </span>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                editing === "shutterstock" ? (
                  <>
                    <button
                      onClick={() => handleSave("shutterstock")}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaSave className="text-xs" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel("shutterstock", shutterstockText)}
                      className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaTimes className="text-xs" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit("shutterstock", shutterstockText)}
                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaEdit className="text-xs" />
                    Edit
                  </button>
                )
              )}
              <button
                onClick={() => copyToClipboard(getText("shutterstock", shutterstockText), "shutterstock")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  copied === "shutterstock"
                    ? "bg-gradient-to-r from-green-600 to-green-500" 
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                }`}
              >
                {copied === "shutterstock" ? <FaCheck /> : <FaCopy />}
                {copied === "shutterstock" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="bg-gray-800 rounded p-3 border border-gray-700">
            {editing === "shutterstock" && isAuthenticated ? (
              <textarea
                value={getText("shutterstock", shutterstockText)}
                onChange={(e) => setEditedTexts({ ...editedTexts, shutterstock: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm text-gray-300 font-mono resize-y min-h-[60px]"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-300 font-mono break-words whitespace-pre-wrap">
                {getText("shutterstock", shutterstockText)}
              </p>
            )}
          </div>
        </div>

        {/* Shutterstock Editorial */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-3 border border-gray-600 hover:border-purple-500/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-400 flex items-center gap-2">
              <FaImage className="text-purple-400" />
              Shutterstock Editorial
            </span>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                editing === "shutterstockEditorial" ? (
                  <>
                    <button
                      onClick={() => handleSave("shutterstockEditorial")}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaSave className="text-xs" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel("shutterstockEditorial", shutterstockEditorialText)}
                      className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaTimes className="text-xs" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit("shutterstockEditorial", shutterstockEditorialText)}
                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaEdit className="text-xs" />
                    Edit
                  </button>
                )
              )}
              <button
                onClick={() => copyToClipboard(getText("shutterstockEditorial", shutterstockEditorialText), "shutterstockEditorial")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  copied === "shutterstockEditorial"
                    ? "bg-gradient-to-r from-green-600 to-green-500" 
                    : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
                }`}
              >
                {copied === "shutterstockEditorial" ? <FaCheck /> : <FaCopy />}
                {copied === "shutterstockEditorial" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="bg-gray-800 rounded p-3 border border-gray-700">
            {editing === "shutterstockEditorial" && isAuthenticated ? (
              <textarea
                value={getText("shutterstockEditorial", shutterstockEditorialText)}
                onChange={(e) => setEditedTexts({ ...editedTexts, shutterstockEditorial: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm text-gray-300 font-mono resize-y min-h-[60px]"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-300 font-mono break-words whitespace-pre-wrap">
                {getText("shutterstockEditorial", shutterstockEditorialText)}
              </p>
            )}
          </div>
        </div>

        {/* Imago */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-3 border border-gray-600 hover:border-cyan-500/50 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-cyan-400 flex items-center gap-2">
              <FaImage className="text-cyan-400" />
              Imago
            </span>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                editing === "imago" ? (
                  <>
                    <button
                      onClick={() => handleSave("imago")}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaSave className="text-xs" />
                      Save
                    </button>
                    <button
                      onClick={() => handleCancel("imago", imagoText)}
                      className="px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaTimes className="text-xs" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEdit("imago", imagoText)}
                    className="px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaEdit className="text-xs" />
                    Edit
                  </button>
                )
              )}
              <button
                onClick={() => copyToClipboard(getText("imago", imagoText), "imago")}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 ${
                  copied === "imago"
                    ? "bg-gradient-to-r from-green-600 to-green-500" 
                    : "bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400"
                }`}
              >
                {copied === "imago" ? <FaCheck /> : <FaCopy />}
                {copied === "imago" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="bg-gray-800 rounded p-3 border border-gray-700">
            {editing === "imago" && isAuthenticated ? (
              <textarea
                value={getText("imago", imagoText)}
                onChange={(e) => setEditedTexts({ ...editedTexts, imago: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-sm text-gray-300 font-mono resize-y min-h-[60px]"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-300 font-mono break-words whitespace-pre-wrap">
                {getText("imago", imagoText)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
