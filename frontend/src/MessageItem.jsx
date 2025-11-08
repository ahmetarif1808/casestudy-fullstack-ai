export default function MessageItem({ msg }) {
  if (!msg) return null;

  const label = (msg.sentimentLabel || "").toLowerCase();
  const isPositive = label === "positive" || label === "pos" || label === "positive";
  const isNegative = label === "negative" || label === "neg" || label === "negative";

  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-medium text-sm">
            {msg.nickname?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="text-sm font-semibold text-gray-800">{msg.nickname}</div>
        </div>

        <div className="text-xs">
          <span className={
            "px-2 py-1 rounded-full text-xs font-semibold " +
            (isPositive ? "bg-emerald-100 text-emerald-800" 
                        : isNegative ? "bg-rose-100 text-rose-800" 
                                     : "bg-gray-100 text-gray-700")
          }>
            {msg.sentimentLabel ?? "unknown"}
          </span>
        </div>
      </div>

      <div className="text-gray-900 mb-2">{msg.text}</div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div>Skor: {typeof msg.sentimentScore === "number" ? msg.sentimentScore.toFixed(3) : "—"}</div>
        <div>{new Date(msg.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
