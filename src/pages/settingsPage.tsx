import { useState, useEffect, useRef } from 'react';
import PaintSidebar from '../components/paintsidebar';
import { useAuthStore } from '../store/useAuthStore';
import { deleteProfile } from '../hooks/user';
import { User, Settings, Shield, Palette, Save, Eye, EyeOff, Upload, Crown, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useUserInfo, updateProfileInfo, uploadProfileImageFile } from '../hooks/user';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import lua from 'react-syntax-highlighter/dist/esm/languages/prism/lua'
SyntaxHighlighter.registerLanguage('lua', lua)
import { usePaymentHistory, useSubscription, cancelSubscription } from '../hooks/payments';
import { getAvailableThemes, getThemeFromString } from '../utils/theme';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number, currency: string = 'ARS') => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

interface ProfileFormValues {
  name: string;
  email: string;
  description: string;
}

const validateProfile = (values: ProfileFormValues) => {
  const errors: Partial<Record<keyof ProfileFormValues, string>> = {};

  // Name validation
  if (!values.name) {
    errors.name = 'Name is required';
  } else if (values.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (values.name.length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }

  // Email validation
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  // Description validation
  if (values.description && values.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  return errors;
};

const themes = getAvailableThemes();
// Validation schema for profile form


const callDeleteProfile = (userId: string) => {
  const navigate = useNavigate();
  if (!userId) {
    alert('User ID is missing. Cannot delete profile.');
  }
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    deleteProfile(userId!)
      .then(() => {
        alert('Profile deleted successfully.');
        // Optionally, redirect to homepage or login page
        
        navigate('/')
      })
      .catch((error) => {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile. Please try again later.');
      });

  }
};

const SettingsPage = () => {
  const authUser = useAuthStore((state) => state.user);
  const { payments } = usePaymentHistory();
  const { subscription, refetch } = useSubscription();
  const { user, loading } = useUserInfo(authUser?.id);
  const navigate = useNavigate();
  const editorTheme = useAuthStore((state) => state.editorTheme);
  const setEditorTheme = useAuthStore((state) => state.setEditorTheme);

  const handleCancelSubscription = async () => {
    if (confirm('¿Estás seguro de que quieres cancelar tu suscripción?')) {
      try {
        await cancelSubscription();
        alert('Suscripción cancelada exitosamente');
        refetch(); // Refrescar datos
      } catch (error) {
        alert('Error al cancelar la suscripción');
      }
    }
  };
  // Profile picture state (file upload only)
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // App preferences state
  const sidebarCollapsed = useAuthStore((state) => state.isDesktopSidebarCollapsed);
  const setSidebarCollapsed = useAuthStore((state) => state.setDesktopSidebarCollapsed);

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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the selected file
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Automatically upload the file
      setUploadingImage(true);
      try {
        // Use the new upload function
        const updatedUser = await uploadProfileImageFile(file);

        // Update the preview with the uploaded image URL
        setPreviewUrl(updatedUser.urlPfp);

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        alert('Profile image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
        // Reset to original profile picture on error
        setPreviewUrl(user?.urlPfp || '');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } finally {
        setUploadingImage(false);
      }
    }
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
        <PaintSidebar selectedPage="settings" />
        <main className="flex-1 ml-0 min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Please log in to access settings</div>
        </main>
      </div>
    );
  }


  return (
    <div className="flex">
      <PaintSidebar selectedPage="settings" />
      <main className="flex-1 ml-0 w-full min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 border-gray-700 border p-6 rounded-xl mb-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Settings className="w-8 h-8" />
              Settings
            </h1>
            <p className="text-gray-400 mt-2">Manage your account and application preferences</p>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-800 overflow-x-auto border-gray-700 border p-2 rounded-xl mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSection('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeSection === 'profile'
                  ? '!bg-blue-600 text-white'
                  : 'text-gray-400 hocus:text-white hocus:!bg-gray-700'
                  }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveSection('preferences')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeSection === 'preferences'
                  ? '!bg-blue-600 text-white'
                  : 'text-gray-400 hocus:text-white hocus:!bg-gray-700'
                  }`}
              >
                <Palette className="w-4 h-4" />
                Preferences
              </button>
              <button
                onClick={() => setActiveSection('subscription')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeSection === 'subscription'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                <Crown className="w-4 h-4" />
                Subscription
              </button>
              <button
                onClick={() => setActiveSection('payments')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeSection === 'payments'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
              >
                <CreditCard className="w-4 h-4" />
                Payments
              </button>
              <button
                onClick={() => setActiveSection('account')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeSection === 'account'
                  ? '!bg-blue-600 text-white'
                  : 'text-gray-400 hocus:text-white hocus:!bg-gray-700'
                  }`}
              >
                <Shield className="w-4 h-4" />
                Account
              </button>
            </div>
          </div>

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-gray-800 p-6 rounded-xl border-gray-700 border mb-6">
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
                    <div className="relative w-16 h-16">
                      {(uploadingImage || loading) ? (
                        <div className="absolute animate-pulse inset-0 flex items-center justify-center bg-gray-900 rounded-full z-10">

                        </div>
                      ) : <img
                        src={previewUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user?.id}`}
                        alt="Profile"
                        className="w-16 h-16 rounded-full border-2 border-gray-600 object-cover"
                        style={{ opacity: uploadingImage || loading ? 0.5 : 1 }}
                      />}

                    </div>
                    <div className="flex-1 space-y-3">
                      {/* File Upload */}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                            className="flex items-center gap-2 px-3 py-2 !bg-gray-600 text-white text-sm rounded hocus:!bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Upload className="w-4 h-4" />
                            {uploadingImage ? 'Uploading...' : 'Choose File'}
                          </button>
                          {uploadingImage && (
                            <span className="text-sm text-blue-400">
                              Uploading image...
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Upload an image file (JPG, PNG, GIF) - uploads automatically when selected
                        </p>
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
                  validate={validateProfile}
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
                          disabled={user?.oauth === true} // Disable if OAuth user
                          placeholder="your.email@example.com"
                          className={`${user?.oauth === true ? 'bg-gray-900 cursor-not-allowed' : 'bg-gray-700'} w-full px-3 py-2 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                        <div className={`p-3 rounded ${status.type === 'success'
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isSubmitting
                          ? '!bg-gray-600 text-gray-400 cursor-not-allowed'
                          : '!bg-blue-600 text-white hocus:!bg-blue-700'
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
          {/* Subscription Section */}
          {activeSection === 'subscription' && (
            <div className="bg-gray-800 p-6 rounded-xl border-gray-700 border mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription Management
              </h2>

              {subscription && new Date(subscription.endDate) > new Date() ? (
                <div className="space-y-6">
                  {/* Current Plan Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-6 h-6 text-yellow-300" />
                          <h3 className="text-2xl font-bold text-white">Paint Nitro</h3>
                        </div>
                        <p className="text-purple-100">Premium features unlocked</p>
                      </div>
                      <span
                        className={`px-3 py-1 text-white text-sm font-semibold rounded-full ${subscription.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-red-500"
                          }`}
                      >
                        {subscription.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <p className="text-purple-200 text-sm">Amount</p>
                        <p className="text-white font-semibold text-lg">
                          {formatCurrency(subscription.amount)} ARS /month
                        </p>
                      </div>
                      <div>
                        <p className="text-purple-200 text-sm">{subscription.status === "ACTIVE" ? "Next Billing": "Subscription End"}</p>
                        <p className="text-white font-semibold">
                          {formatDate(subscription.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Status</span>
                      <span className="flex items-center gap-2 text-green-400 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        {subscription.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Started</span>
                      <span className="text-white">{formatDate(subscription.startDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Plan</span>
                      <span className="text-white font-semibold">{subscription.plan}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-3">Active Features</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Hide your source code
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        More interactions in your posts
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Early access to new features
                      </li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3">
                    <button onClick={handleCancelSubscription} className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Active Subscription</h3>
                  <p className="text-gray-400 mb-6">Upgrade to Paint Nitro for premium features</p>
                  <button onClick={()=> navigate("/comprar-nitro")} className="cursor-pointer px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                    Upgrade to Nitro
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payments Section */}
          {activeSection === 'payments' && (
            <div className="bg-gray-800 p-6 rounded-xl border-gray-700 border mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment History
              </h2>

              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-gray-700 p-4 rounded-lg flex items-center justify-between hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${payment.status === 'COMPLETED' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                          {payment.status === 'COMPLETED' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <XCircle className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{payment.plan}</p>
                          <p className="text-gray-400 text-sm">{formatDate(payment.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{formatCurrency(payment.amount)}</p>
                        <span className={`text-sm ${payment.status === 'COMPLETED' ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Payment History</h3>
                  <p className="text-gray-400">Your payment history will appear here</p>
                </div>
              )}

              {/* Summary Card */}
              {payments.length > 0 && (
                <div className="mt-6 bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-white font-semibold mb-3">Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Total Payments</span>
                      <span className="text-white font-semibold">{payments.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Successful</span>
                      <span className="text-green-400 font-semibold">
                        {payments.filter(p => p.status === 'COMPLETED').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Failed</span>
                      <span className="text-red-400 font-semibold">
                        {payments.filter(p => p.status === 'FAILED').length}
                      </span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between">
                      <span className="text-white font-semibold">Total Spent</span>
                      <span className="text-white font-bold">
                        {formatCurrency(
                          payments
                            .filter(p => p.status === 'COMPLETED')
                            .reduce((sum, p) => sum + p.amount, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="bg-gray-800 p-6  border-gray-700 border rounded-xl mb-6">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prefered Editor Theme
                </label>
                <div className="flex items-center gap-4">
                  <select
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                    className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 hocus:bg-gray-600 focus:outline-none focus:border-blue-500"
                  >
                    {themes.map((themeName) => (
                      <option key={themeName} value={themeName}>
                        {themeName}
                      </option>
                    ))}
                  </select>
                </div>
                <SyntaxHighlighter
                  language="lua"
                  style={getThemeFromString(editorTheme)}
                  className="*:!p-0 w-[70vw] md:w-full"
                  customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                    }
                  }}

                >{`local max = 20
for x = 0, max do
  for y = 0, max do
      grid:set_pixel(x, y, math.max(255 - (255/size) * x, 0), 0, 0)
  end
end`}
                </SyntaxHighlighter>
              </div>
            </div>
          )}

          {/* Account Section */}
          {activeSection === 'account' && (
            <div className="bg-gray-800 border-gray-700 border p-6 rounded-xl mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Security
              </h2>

              <div className="space-y-6">
                {/* Change Password */}
                {user?.oauth === true ? (<div> <p className="text-gray-400">No puedes cambiar la contraseña al ser una cuenta oauth</p></div>
                ) : (<div>
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
                      className="flex items-center gap-2 px-4 py-2 !bg-blue-600 text-white rounded-lg hocus:!bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                </div>)}

                {/* Danger Zone */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-red-400 mb-3">Danger Zone</h3>
                  <div className="space-y-3">

                    <button onClick={() => callDeleteProfile(user!.id)} className="w-full px-4 py-2 !bg-red-700 text-white rounded-lg hocus:!bg-red-800 transition-colors">
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
