import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon, Upload, Link, X } from 'lucide-react';
import api from '../../utils/api';

const HeroSlidesManagement = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  // Image upload state
  const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
  const [mobileImageMode, setMobileImageMode] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mobileImagePreview, setMobileImagePreview] = useState(null);

  const imageInputRef = useRef(null);
  const mobileImageInputRef = useRef(null);

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

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'desktop') {
        setImageFile(file);
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: '' }));
      } else {
        setMobileImageFile(file);
        setMobileImagePreview(reader.result);
        setFormData(prev => ({ ...prev, mobileImage: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFileSelection = (type) => {
    if (type === 'desktop') {
      setImageFile(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
    } else {
      setMobileImageFile(null);
      setMobileImagePreview(null);
      if (mobileImageInputRef.current) mobileImageInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate that images are provided
      const hasDesktopImage = imageFile || formData.image || (editingSlide && editingSlide.image);
      const hasMobileImage = mobileImageFile || formData.mobileImage || (editingSlide && editingSlide.mobileImage);

      if (!hasDesktopImage) {
        alert('Please provide a desktop image (upload a file or enter a URL)');
        setSubmitting(false);
        return;
      }
      if (!hasMobileImage) {
        alert('Please provide a mobile image (upload a file or enter a URL)');
        setSubmitting(false);
        return;
      }

      // Use FormData if files are being uploaded
      const hasFiles = imageFile || mobileImageFile;
      
      if (hasFiles) {
        const submitFormData = new FormData();
        
        // Append text fields
        submitFormData.append('title', formData.title);
        submitFormData.append('subtitle', formData.subtitle);
        submitFormData.append('description', formData.description);
        submitFormData.append('buttonText', formData.buttonText);
        submitFormData.append('buttonLink', formData.buttonLink);
        submitFormData.append('backgroundColor', formData.backgroundColor);
        submitFormData.append('textColor', formData.textColor);
        submitFormData.append('isActive', formData.isActive);
        submitFormData.append('order', Number(formData.order) || 0);
        submitFormData.append('startDate', formData.startDate);
        submitFormData.append('endDate', formData.endDate);

        // Append files or URL fallbacks
        if (imageFile) {
          submitFormData.append('imageFile', imageFile);
        } else if (formData.image) {
          submitFormData.append('image', formData.image);
        }

        if (mobileImageFile) {
          submitFormData.append('mobileImageFile', mobileImageFile);
        } else if (formData.mobileImage) {
          submitFormData.append('mobileImage', formData.mobileImage);
        }

        if (editingSlide) {
          await api.put(`/hero-slides/${editingSlide._id}`, submitFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await api.post('/hero-slides', submitFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      } else {
        // No files — send JSON as before
        const submitData = {
          ...formData,
          order: Number(formData.order) || 0,
        };
        
        if (editingSlide) {
          await api.put(`/hero-slides/${editingSlide._id}`, submitData);
        } else {
          await api.post('/hero-slides', submitData);
        }
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
    } finally {
      setSubmitting(false);
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
    // When editing, default to URL mode showing existing URLs
    setImageMode('url');
    setMobileImageMode('url');
    setImageFile(null);
    setMobileImageFile(null);
    setImagePreview(null);
    setMobileImagePreview(null);
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
    // Reset file states
    setImageMode('upload');
    setMobileImageMode('upload');
    setImageFile(null);
    setMobileImageFile(null);
    setImagePreview(null);
    setMobileImagePreview(null);
  };

  // Reusable image input component
  const ImageInput = ({ label, mode, setMode, file, preview, inputRef, urlValue, type }) => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium dark:text-gray-300">
          {label} *
        </label>
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              if (type === 'desktop') {
                setFormData(prev => ({ ...prev, image: '' }));
              } else {
                setFormData(prev => ({ ...prev, mobileImage: '' }));
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Upload size={12} />
            Upload
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('url');
              clearFileSelection(type);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'url'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Link size={12} />
            URL
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div>
          {/* Drop zone / file input */}
          {!file && !preview ? (
            <label
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                <Upload size={24} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  JPEG, PNG, GIF (max 5MB)
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={(e) => handleFileSelect(e, type)}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={() => clearFileSelection(type)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={14} />
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {file?.name}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={urlValue}
            onChange={(e) => {
              if (type === 'desktop') {
                setFormData(prev => ({ ...prev, image: e.target.value }));
              } else {
                setFormData(prev => ({ ...prev, mobileImage: e.target.value }));
              }
            }}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="/image.jpg or https://..."
          />
          {urlValue && (
            <img
              src={urlValue}
              alt="URL Preview"
              className="w-full h-24 object-cover rounded-lg mt-2 border border-gray-300 dark:border-gray-600"
              onError={(e) => { e.target.style.display = 'none'; }}
              onLoad={(e) => { e.target.style.display = 'block'; }}
            />
          )}
        </div>
      )}
    </div>
  );

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

              {/* Image Upload Section */}
              <div className="grid grid-cols-2 gap-4">
                <ImageInput
                  label="Desktop Image"
                  mode={imageMode}
                  setMode={setImageMode}
                  file={imageFile}
                  preview={imagePreview}
                  inputRef={imageInputRef}
                  urlValue={formData.image}
                  type="desktop"
                />

                <ImageInput
                  label="Mobile Image"
                  mode={mobileImageMode}
                  setMode={setMobileImageMode}
                  file={mobileImageFile}
                  preview={mobileImagePreview}
                  inputRef={mobileImageInputRef}
                  urlValue={formData.mobileImage}
                  type="mobile"
                />
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
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {submitting ? 'Saving...' : (editingSlide ? 'Update' : 'Create')}
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
