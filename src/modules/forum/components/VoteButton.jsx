/**
 * VoteButton Component - Nút vote
 */

export const VoteButton = ({ isVoted = false, voteCount = 0, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
        isVoted
          ? 'bg-red-100 text-red-600 hover:bg-red-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <span className="text-xl">❤️</span>
      <span>{voteCount}</span>
    </button>
  );
};

export default VoteButton;
