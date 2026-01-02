import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';

const PromotionBannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    text: '',
    code: '',
    icon: '🔥',
    backgroundColor: '#1e3a8a',
    textColor: '#ffffff',
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    link: '',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await api.get('/promotion-banner');
      setBanners(response.data.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await api.put(`/promotion-banner/${editingBanner._id}`, formData);
      } else {
        await api.post('/promotion-banner', formData);
      }
      fetchBanners();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving banner:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to save banner';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/promotion-banner/${id}`);
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      text: banner.text,
      code: banner.code || '',
      icon: banner.icon || '🔥',
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      link: banner.link || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      text: '',
      code: '',
      icon: '🔥',
      backgroundColor: '#1e3a8a',
      textColor: '#ffffff',
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      link: '',
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Promotion Banner Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      <div className="grid gap-4">
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div
                className="p-3 rounded mb-2"
                style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
              >
                <span className="mr-2">{banner.icon}</span>
                {banner.text}
                {banner.code && <span className="font-bold ml-2">{banner.code}</span>}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className={`inline-flex items-center gap-1 ${banner.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="ml-4">
                  Start: {new Date(banner.startDate).toLocaleDateString()}
                </span>
                {banner.endDate && (
                  <span className="ml-4">
                    End: {new Date(banner.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(banner)}
                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(banner._id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              {editingBanner ? 'Edit Banner' : 'Add New Banner'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Promotion Text *
                </label>
                <input
                  type="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                  Promotion Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  maxLength={50}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Icon
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                    Link (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  {editingBanner ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionBannerManagement;
