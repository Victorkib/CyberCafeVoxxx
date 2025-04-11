import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ReviewList({ reviews }) {
  if (!reviews?.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {review.user.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{review.user.name}</div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
          </div>

          <h3 className="font-medium text-gray-900 mb-2">{review.title}</h3>
          <p className="text-gray-600">{review.comment}</p>

          {review.reply && (
            <div className="mt-4 pl-4 border-l-2 border-blue-200">
              <div className="text-sm font-medium text-blue-600">Store Response:</div>
              <p className="text-sm text-gray-600">{review.reply}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 