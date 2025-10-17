export const ScoreItem = ({ label, value }) => (
  <div className="flex justify-between items-baseline bg-gray-100 rounded gap-1">
    <span className="text-[0.75rem] text-gray-400">{label}:</span>
    <span className="text-[0.75rem] text-black font-medium">{value}</span>
  </div>
)
