import React, { useState, useEffect } from 'react';
import { photosAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Photo {
  id: number;
  url: string;
  caption?: string;
  createdAt: string;
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

interface PhotoGalleryProps {
  entityType: 'club' | 'league' | 'tournament' | 'user';
  entityId: number;
  canUpload?: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  entityType,
  entityId,
  canUpload = true,
}) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    fetchPhotos();
  }, [entityType, entityId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photosAPI.getPhotos(entityType, entityId);
      setPhotos(response.photos);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      const photo = await photosAPI.uploadPhoto(entityType, entityId, file, caption);
      setPhotos([photo, ...photos]);
      setCaption('');
      e.target.value = ''; // Reset input
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Delete this photo?')) return;

    try {
      await photosAPI.deletePhoto(photoId);
      setPhotos(photos.filter((p) => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Upload Section */}
      {canUpload && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-700">Upload Photo</span>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <div className="mt-2 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              {uploading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <PhotoIcon className="w-6 h-6" />
                  <span>Click to select photo</span>
                </div>
              )}
            </div>
          </label>
          <p className="mt-2 text-xs text-gray-500">
            Supported: JPEG, PNG, GIF, WebP (max 5MB)
          </p>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700" />
            </button>

            {/* Photo */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Photo'}
              className="w-full max-h-[70vh] object-contain bg-black"
            />

            {/* Info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {selectedPhoto.user.profilePhoto ? (
                    <img
                      src={selectedPhoto.user.profilePhoto}
                      alt={`${selectedPhoto.user.firstName} ${selectedPhoto.user.lastName}`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                      {selectedPhoto.user.firstName[0]}{selectedPhoto.user.lastName[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedPhoto.user.firstName} {selectedPhoto.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedPhoto.userId === user?.id && (
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                )}
              </div>

              {selectedPhoto.caption && (
                <p className="mt-3 text-gray-700">{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
