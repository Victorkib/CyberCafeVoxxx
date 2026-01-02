import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/api';

const HeroSlidesManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    mobileImage: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    isActive: true,
    order: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await api.get('/hero-slides');
      setSlides(response.data.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure order is a number and prepare data
      const submitData = {
        ...formData,
        order: Number(formData.order) || 0,
      };
      
      if (editingSlide) {
        await api.put(`/hero-slides/${editingSlide._id}`, submitData);
      } else {
        await api.post('/hero-slides', submitData);
      }
      fetchSlides();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving slide:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle validation errors (Mongoose returns array of errors)
      let errorMessage = 'Failed to save slide';
      if (error.response?.data) {
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;
    try {
      await api.delete(`/hero-slides/${id}`);
      fetchSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      image: slide.image,
      mobileImage: slide.mobileImage,
      buttonText: slide.buttonText || '',
      buttonLink: slide.buttonLink || '',
      backgroundColor: slide.backgroundColor,
      textColor: slide.textColor,
      isActive: slide.isActive,
      order: slide.order,
      startDate: new Date(slide.startDate).toISOString().split('T')[0],
      endDate: new Date(slide.endDate).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      mobileImage: '',
      buttonText: '',
      buttonLink: '',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      isActive: true,
      order: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Hero Slides Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Slide
        </button>
      </div>

      <div className="grid gap-4">
        {slides.map((slide) => (
          <div
            key={slide._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            <div className="flex">
              <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-4">
                <h3 className="text-lg font-bold dark:text-white">{slide.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{slide.subtitle}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className={`inline-flex items-center gap-1 ${slide.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    {slide.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span>Order: {slide.order}</span>
                  <span>
                    {new Date(slide.startDate).toLocaleDateString()} - {new Date(slide.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4">
                <button
                  onClick={() => handleEdit(slide)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(slide._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {editingSlide ? 'Edit Slide' : 'Add New Slide'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Desktop Image URL *
                  </label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    placeholder="/image.jpg or https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Mobile Image URL *
                  </label>
                  <input
                    type="text"
                    value={formData.mobileImage}
                    onChange={(e) => setFormData({ ...formData, mobileImage: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                    placeholder="/image-mobile.jpg or https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-full h-10 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                    className="w-full h-10 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium dark:text-gray-300">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSlide ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSlidesManagement;
