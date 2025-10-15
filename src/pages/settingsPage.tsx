import { useState, useEffect, useRef } from 'react';
import PaintSidebar from '../components/paintsidebar';
import { useAuthStore } from '../store/useAuthStore';
import { User, Settings, Shield, Palette, Save, Eye, EyeOff, Upload } from 'lucide-react';
import { useUserInfo, updateProfileInfo, uploadProfileImageFile } from '../hooks/user';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation schema for profile form
const profileValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  description: Yup.string()
    .max(500, 'Description must be less than 500 characters')
});

const SettingsPage = () => {
  const auth = useAuthStore();
  const authUser = auth.user; 
  const {user, loading} = useUserInfo(authUser?.id)
  
  // Profile picture state (file upload only)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // App preferences state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(auth.isDesktopSidebarCollapsed);
  const [notifications, setNotifications] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  
  // Account settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    // Set initial preview URL when user data loads
    if (user && !loading) {
      setPreviewUrl(user.urlPfp || '');
    }
  }, [user, loading]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for the selected file
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploadingImage(true);
    try {
      // Use the new upload function
      const updatedUser = await uploadProfileImageFile(selectedFile);
      
      // Update the preview with the uploaded image URL
      setPreviewUrl(updatedUser.urlPfp);
      setSelectedFile(null);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      alert('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Reset to original profile picture
    setPreviewUrl(user?.urlPfp || '');
  };

  const handleSavePreferences = () => {
    // Update sidebar preference
    auth.setDesktopSidebarCollapsed(sidebarCollapsed);
    // TODO: Save other preferences to backend
    console.log('Saving preferences:', { sidebarCollapsed, notifications, privateProfile });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // TODO: Implement password change API call
    console.log('Changing password');
  };

  if (!authUser) {
    return (
      <div className="flex">
        <PaintSidebar />
        <main className="flex-1 ml-0 min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Please log in to access settings</div>
        </main>
      </div>
    );
  }


  return (
    <div className="flex">
      <PaintSidebar />
      <main className="flex-1 ml-0 min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 p-6 rounded-xl mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-gray-400 mt-2">Manage your account and application preferences</p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-800 p-2 rounded-xl mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'profile' 
                    ? '!bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:!bg-gray-700'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveSection('preferences')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'preferences' 
                    ? '!bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:!bg-gray-700'
                }`}
              >
                <Palette className="w-4 h-4" />
                Preferences
              </button>
              <button
                onClick={() => setActiveSection('account')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeSection === 'account' 
                    ? '!bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:!bg-gray-700'
                }`}
              >
                <Shield className="w-4 h-4" />
                Account
              </button>
            </div>
          </div>

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-gray-800 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </h2>
              
              <div className="space-y-6">
                {/* Profile Picture - File Upload Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-start gap-4">
                    <img
                      src={previewUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.name || 'user'}`}
                      alt="Profile"
                      className="w-16 h-16 rounded-full border-2 border-gray-600 object-cover"
                    />
                    <div className="flex-1 space-y-3">
                      {/* File Upload */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-3 py-2 !bg-gray-600 text-white text-sm rounded hover:!bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Upload className="w-4 h-4" />
                            Choose File
                          </button>
                          {selectedFile && (
                            <span className="text-sm text-gray-300">
                              {selectedFile.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Upload an image file (JPG, PNG, GIF)</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {selectedFile && (
                          <>
                            <button
                              onClick={handleFileUpload}
                              disabled={uploadingImage}
                              className={`px-3 py-1 text-sm rounded transition-colors ${
                                uploadingImage
                                  ? '!bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : '!bg-blue-600 text-white hover:!bg-blue-700'
                              }`}
                            >
                              {uploadingImage ? 'Uploading...' : 'Upload File'}
                            </button>
                            <button
                              onClick={clearSelectedFile}
                              disabled={uploadingImage}
                              className="px-3 py-1 !bg-gray-600 text-white text-sm rounded hover:!bg-gray-500 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Form with Formik */}
                <Formik
                  initialValues={{
                    name: user?.name || '',
                    email: user?.email || '',
                    description: user?.description || ''
                  }}
                  validationSchema={profileValidationSchema}
                  enableReinitialize={true}
                  onSubmit={async (values, { setSubmitting, setStatus }) => {
                    try {
                      setStatus(null);
                      await updateProfileInfo({
                        name: values.name,
                        email: values.email,
                        description: values.description,
                        id: user?.id || ''
                      });
                      setStatus({ type: 'success', message: 'Profile updated successfully!' });
                    } catch (error) {
                      console.error('Error updating profile:', error);
                      setStatus({ type: 'error', message: 'Failed to update profile' });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, status }) => (
                    <Form className="space-y-4">
                      {/* Email Field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <Field
                          type="email"
                          id="email"
                          name="email"
                          disabled={user?.oauth} // Disable if OAuth user
                          placeholder="your.email@example.com"
                          className={`${user?.oauth ? 'bg-gray-900 cursor-not-allowed' : 'bg-gray-700'} w-full px-3 py-2 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <ErrorMessage name="email" component="div" className="text-red-400 text-sm mt-1" />
                      </div>

                      {/* Display Name Field */}
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                          Display Name
                        </label>
                        <Field
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Your display name"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <ErrorMessage name="name" component="div" className="text-red-400 text-sm mt-1" />
                      </div>

                      {/* Description Field */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                          Bio/Description
                        </label>
                        <Field
                          as="textarea"
                          id="description"
                          name="description"
                          placeholder="Tell others about yourself..."
                          rows={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <ErrorMessage name="description" component="div" className="text-red-400 text-sm mt-1" />
                      </div>

                      {/* Status Messages */}
                      {status && (
                        <div className={`p-3 rounded ${
                          status.type === 'success' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {status.message}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                          isSubmitting
                            ? '!bg-gray-600 text-gray-400 cursor-not-allowed'
                            : '!bg-blue-600 text-white hover:!bg-blue-700'
                        }`}
                      >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="bg-gray-800 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                App Preferences
              </h2>
              
              <div className="space-y-6">
                {/* Sidebar Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sidebar
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={sidebarCollapsed}
                      onChange={(e) => setSidebarCollapsed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Collapse sidebar by default</span>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notifications
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Enable notifications</span>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Privacy
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={privateProfile}
                      onChange={(e) => setPrivateProfile(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Make profile private</span>
                  </div>
                </div>

                <button
                  onClick={handleSavePreferences}
                  className="flex items-center gap-2 px-4 py-2 !bg-blue-600 text-white rounded-lg hover:!bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Account Section */}
          {activeSection === 'account' && (
            <div className="bg-gray-800 p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Security
              </h2>
              
              <div className="space-y-6">
                {/* Change Password */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-300 flex items-center gap-1">
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        Show passwords
                      </span>
                    </div>

                    <button
                      onClick={handleChangePassword}
                      className="flex items-center gap-2 px-4 py-2 !bg-blue-600 text-white rounded-lg hover:!bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-red-400 mb-3">Danger Zone</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 !bg-red-600 text-white rounded-lg hover:!bg-red-700 transition-colors">
                      Export Account Data
                    </button>
                    <button className="w-full px-4 py-2 !bg-red-700 text-white rounded-lg hover:!bg-red-800 transition-colors">
                      Delete Account
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    These actions are permanent and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
