import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../../redux/slices/wishlistSlice';
import { toast } from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.wishlist);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    toast.success('Added to cart');
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    if (wishlist.includes(product._id)) {
      dispatch(removeFromWishlist(product._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(product._id));
      toast.success('Added to wishlist');
    }
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square rounded-t-lg overflow-hidden bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {product.tag && (
          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md bg-blue-600 text-white">
            {product.tag}
          </div>
        )}
        {product.discountPercentage > 0 && (
          <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-md bg-red-600 text-white">
            -{product.discountPercentage}%
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div
        className={`absolute top-2 right-2 flex flex-col space-y-2 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={handleAddToWishlist}
          className={`p-2 rounded-full bg-white shadow-md ${
            wishlist.includes(product._id)
              ? 'text-red-600'
              : 'text-gray-600 hover:text-red-600'
          }`}
        >
          <Heart className="w-5 h-5" />
        </button>
        <button
          onClick={handleAddToCart}
          className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-blue-600"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.floor(product.rating || 0)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-500">
            ({product.reviewCount || 0})
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-lg font-bold text-gray-900">
            ${product.price?.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
} 