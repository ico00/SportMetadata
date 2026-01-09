import { Match } from "../types";
import { stockAgencies, formatForShutterstock, StockAgency } from "../utils/stockAgencies";

interface StockAgenciesPanelProps {
  match: Match | null;
}

export default function StockAgenciesPanel({ match }: StockAgenciesPanelProps) {
  if (!match) {
    return null;
  }

  const shutterstockText = formatForShutterstock(match);

  const copyToClipboard = (text: string, agencyName: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${agencyName} text copied to clipboard!`);
    }).catch((err) => {
      alert(`Failed to copy: ${err}`);
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Stock Agencies Format</h2>

      <div className="space-y-4">
        {/* Shutterstock */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-400">Shutterstock</span>
            <button
              onClick={() => copyToClipboard(shutterstockText, "Shutterstock")}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-800 rounded p-3">
            <p className="text-sm text-gray-300 font-mono break-words">
              {shutterstockText}
            </p>
          </div>
        </div>

        {/* Placeholder for future agencies */}
        <div className="text-xs text-gray-400 text-center">
          More agencies will be added in the future
        </div>
      </div>
    </div>
  );
}
