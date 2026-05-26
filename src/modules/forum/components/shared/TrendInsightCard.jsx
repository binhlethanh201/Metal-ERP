/**
 * TrendInsightCard - Thẻ insight xu hướng (dùng trong ForumCategory).
 * Hiển thị: % tăng/giảm, icon xu hướng, lý do, số đề xuất.
 */
/**
 * TrendInsightCard Component - Thẻ xu hướng/insights
 */

export const TrendInsightCard = ({ trend, type = 'trend' }) => {
  const isUp = trend.trend === 'up';
  const bgColor = isUp ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = isUp ? 'text-green-700' : 'text-red-700';
  const trendIcon = isUp ? '📈' : '📉';

  return (
    <div
      className={`rounded-lg border border-slate-200 p-4 transition-shadow hover:shadow-md ${bgColor}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-sm font-bold text-slate-900">{trend.title}</h3>
        <span className="text-2xl">{trendIcon}</span>
      </div>

      <div className={`text-2xl font-bold ${textColor}`}>
        {isUp ? '+' : '-'}
        {trend.percentage}%
      </div>

      {type === 'suggestion' && trend.reason && (
        <p className="mt-2 text-xs text-slate-500">{trend.reason}</p>
      )}

      {type === 'suggestion' && trend.votes && (
        <div className="mt-3 border-t border-current border-opacity-20 pt-3">
          <span className="text-xs font-medium text-slate-600">👍 {trend.votes} đề xuất</span>
        </div>
      )}
    </div>
  );
};

export default TrendInsightCard;
