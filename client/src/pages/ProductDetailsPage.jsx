import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart } from '../redux/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { fetchProductDetails, fetchRelatedProducts } from '../redux/slices/productsSlice';
import { fetchProductReviews, addProductReview } from '../redux/slices/reviewsSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewList from '../components/reviews/ReviewList';
import ProductCard from '../components/products/ProductCard';
import { toast } from 'react-hot-toast';

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentProduct, relatedProducts, loading, error } = useSelector((state) => state.products);
  const { reviews, loading: reviewsLoading } = useSelector((state) => state.reviews);
  const { wishlist } = useSelector((state) => state.wishlist);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(productId));
    dispatch(fetchRelatedProducts(productId));
    dispatch(fetchProductReviews(productId));
  }, [dispatch, productId]);

  const handleQuantityChange = (value) => {
    setQuantity((prev) => Math.max(1, prev + value));
  };

 const handleAddToCart = () => {
  if (!user) {
    toast.error('Please login to add items to cart');
    return;
  }

  if (currentProduct.variants && (!selectedSize || !selectedColor)) {
    toast.error('Please select size and color');
    return;
  }

  dispatch(addToCart({
    productId: currentProduct._id,
    quantity,
    size: selectedSize,
    color: selectedColor
  }));
  toast.success('Added to cart');
};

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    if (wishlist.includes(currentProduct._id)) {
      dispatch(removeFromWishlist(currentProduct._id));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlist(currentProduct._id));
      toast.success('Added to wishlist');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: currentProduct.name,
        text: currentProduct.description,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await dispatch(addProductReview({
        productId,
        ...reviewData
      })).unwrap();
      toast.success('Review submitted successfully');
      setShowReviewForm(false);
    } catch (error) {
      toast.error(error.message || 'Error submitting review');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!currentProduct) return <ErrorMessage message="Product not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <button onClick={() => navigate(-1)} className="hover:text-blue-600">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span>Products</span>
        <ChevronRight className="w-4 h-4" />
        <span>{currentProduct.category?.name}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{currentProduct.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentProduct.images[selectedImage]}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
            {currentProduct.tag && (
              <div className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-md bg-blue-600 text-white">
                {currentProduct.tag}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {currentProduct.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? 'border-blue-600'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`${currentProduct.name} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentProduct.name}</h1>
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < Math.floor(currentProduct.rating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {currentProduct.rating?.toFixed(1) || '0.0'} ({currentProduct.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">
              ${currentProduct.price?.toFixed(2)}
            </span>
            {currentProduct.originalPrice && (
              <span className="ml-3 text-lg text-gray-500 line-through">
                ${currentProduct.originalPrice.toFixed(2)}
              </span>
            )}
            {currentProduct.discountPercentage && (
              <span className="ml-3 text-sm font-medium text-green-600">
                Save {currentProduct.discountPercentage}%
              </span>
            )}
          </div>

          <p className="text-gray-600">{currentProduct.description}</p>

          {/* Variants */}
          {currentProduct.variants && (
            <div className="space-y-4">
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.variants.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md ${
                        selectedSize === size
                          ? 'border-blue-600 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.variants.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color
                          ? 'border-blue-600'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddToWishlist}
                className={`p-2 rounded-md ${
                  wishlist.includes(currentProduct._id)
                    ? 'text-red-600 bg-red-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Free shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Secure payment</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              <span className="text-sm">30-day returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <span className="text-sm">24/7 support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Customer Reviews</h2>
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-blue-600 hover:text-blue-700"
            >
              Write a Review
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8"
            >
              <ReviewForm
                onSubmit={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {reviewsLoading ? (
          <LoadingSpinner />
        ) : (
          <ReviewList reviews={reviews} />
        )}
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
} 