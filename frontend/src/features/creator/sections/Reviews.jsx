import { Star, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { getCreatorReviews } from "../../../api/creatorApi";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getCreatorReviews();
      setReviews(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleReply = (reviewId) => {
    setReviews(
      reviews.map((r) => (r.id === reviewId ? { ...r, responded: true } : r)),
    );
    setReplyingTo(null);
    setReplyText("");
  };

  // Calculate stats
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts.hasOwnProperty(r.rating)) {
      ratingCounts[r.rating]++;
    }
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratingCounts[stars],
    percentage:
      reviews.length > 0
        ? Math.round((ratingCounts[stars] / reviews.length) * 100)
        : 0,
  }));

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Reviews
        </h1>
        <p className="text-stone-600">See what visitors are saying</p>
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Overall Rating */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-3xl font-serif font-bold text-stone-900 mb-2">
                {avgRating}
              </div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(avgRating)
                        ? "fill-gold-400 text-gold-400"
                        : "fill-stone-200 text-stone-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-stone-500">{reviews.length} reviews</p>
            </div>

            {/* Right: Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map((rating) => (
                <div key={rating.stars} className="flex items-center gap-3">
                  <span className="text-sm text-stone-600 w-8">
                    {rating.stars}
                  </span>
                  <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                  <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-400 rounded-full"
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-stone-500 w-12 text-right">
                    {rating.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review Cards */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-stone-200 rounded-lg p-6 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                    <span className="font-semibold text-gold-600">
                      {review.user_name?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-stone-900">
                      {review.user_name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-gold-400 text-gold-400"
                            : "fill-stone-200 text-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                  {review.responded && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Replied
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-stone-700 mb-4">{review.comment}</p>

              {/* Reply Section */}
              {!review.responded && replyingTo !== review.id && (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="flex items-center gap-2 px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Reply</span>
                </button>
              )}

              {/* Reply Form */}
              {replyingTo === review.id && (
                <div className="pl-4 border-l-2 border-gold-200 mt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    rows="3"
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReply(review.id)}
                      className="px-4 py-2 bg-gold-400 text-white rounded-lg hover:bg-gold-500 transition-colors"
                    >
                      Send Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-500">No reviews yet</p>
        </div>
      )}
    </div>
  );
}
