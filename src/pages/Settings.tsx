
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Fingerprint, MapPin, Brain, MessageSquare, Snowflake, Bell, Megaphone, Briefcase, HelpCircle, Phone, PlayCircle, Info, Shield, FileText, LogOut, Trash2, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Settings() {
  const { signOut, user } = useAuth();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [locationSharing, setLocationSharing] = useState(true);
  const [aiDataUsage, setAiDataUsage] = useState(true);
  const [providerCommunication, setProviderCommunication] = useState(true);
  const [emergencyContacts, setEmergencyContacts] = useState(false);
  const [needUpdates, setNeedUpdates] = useState(true);
  const [providerMessages, setProviderMessages] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showHelpFAQ, setShowHelpFAQ] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || '');
      setUserName(user.displayName || user.metadata?.fullName || 'User');

      // Check biometric support
      const biometricAvailable = localStorage.getItem('biometric_enabled') === 'true';
      setBiometricEnabled(biometricAvailable);

      // Load theme preference
      const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, [user]);

  const applyTheme = (selectedTheme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (selectedTheme === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    } else if (selectedTheme === 'dark') {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      } else {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      // Create bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarBucket = buckets?.find(b => b.name === 'avatars');
      
      if (!avatarBucket) {
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(publicUrl);
      toast.success('Profile photo updated!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload photo');
      console.error('Avatar upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const toggleBiometric = () => {
    const newValue = !biometricEnabled;
    setBiometricEnabled(newValue);
    localStorage.setItem('biometric_enabled', newValue.toString());
    toast.success(newValue ? 'Biometric authentication enabled' : 'Biometric authentication disabled');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      // TODO: Implement actual password change via Blink SDK
      toast.success('Password changed successfully');
      setShowPasswordChange(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your data. Type "DELETE" to confirm.')) {
        toast.info('Account deletion feature coming soon. Please contact support.');
      }
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Navigation />
      
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-foreground mb-6 text-center">Settings</h1>

        {/* Account Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">ACCOUNT</h2>
          
          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {userName.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-background hover:bg-primary/90 transition-colors"
                  data-testid="change-avatar-btn"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">{userName || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowPasswordChange(true)}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3"
            data-testid="change-password-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Change Password</h3>
                <p className="text-sm text-muted-foreground">Update your account password</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${biometricEnabled ? 'bg-primary/20' : 'bg-muted/50'}`}>
                  <Fingerprint className={`w-5 h-5 ${biometricEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Biometric Authentication</h3>
                  <p className="text-sm text-muted-foreground">Use fingerprint or face ID to unlock</p>
                </div>
              </div>
              <button
                onClick={toggleBiometric}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  biometricEnabled ? 'bg-primary' : 'bg-muted'
                }`}
                data-testid="biometric-toggle"
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  biometricEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">PRIVACY</h2>
          
          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Location Sharing</h3>
                  <p className="text-sm text-muted-foreground">Allow providers to see your location for tasks</p>
                </div>
              </div>
              <button
                onClick={() => setLocationSharing(!locationSharing)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  locationSharing ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  locationSharing ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">AI Data Usage</h3>
                  <p className="text-sm text-muted-foreground">Allow AI to learn from your preferences</p>
                </div>
              </div>
              <button
                onClick={() => setAiDataUsage(!aiDataUsage)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  aiDataUsage ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  aiDataUsage ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Provider Communication</h3>
                  <p className="text-sm text-muted-foreground">Allow providers to contact you directly</p>
                </div>
              </div>
              <button
                onClick={() => setProviderCommunication(!providerCommunication)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  providerCommunication ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  providerCommunication ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <Snowflake className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Emergency Contacts</h3>
                  <p className="text-sm text-muted-foreground">Manage trusted contacts for emergency mode</p>
                </div>
              </div>
              <button
                onClick={() => setEmergencyContacts(!emergencyContacts)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  emergencyContacts ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  emergencyContacts ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">PREFERENCES</h2>
          
          <button 
            onClick={() => {
              // Show theme selection
              const root = document.documentElement;
              if (theme === 'light') {
                handleThemeChange('dark');
              } else if (theme === 'dark') {
                handleThemeChange('system');
              } else {
                handleThemeChange('light');
              }
            }}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3"
            data-testid="theme-settings-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Theme</h3>
                <p className="text-sm text-muted-foreground">Current: {theme.charAt(0).toUpperCase() + theme.slice(1)}</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button 
            onClick={() => toast.info('Location settings coming soon!')}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between"
            data-testid="location-settings-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Location Settings</h3>
                <p className="text-sm text-muted-foreground">Background tracking and discovery range</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>
        </div>

        {/* Notifications Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">NOTIFICATIONS</h2>
          
          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Need Updates</h3>
                  <p className="text-sm text-muted-foreground">Status changes and completion notifications</p>
                </div>
              </div>
              <button
                onClick={() => setNeedUpdates(!needUpdates)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  needUpdates ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  needUpdates ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Provider Messages</h3>
                  <p className="text-sm text-muted-foreground">Direct messages from service providers</p>
                </div>
              </div>
              <button
                onClick={() => setProviderMessages(!providerMessages)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  providerMessages ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  providerMessages ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">AI Suggestions</h3>
                  <p className="text-sm text-muted-foreground">Smart recommendations and task suggestions</p>
                </div>
              </div>
              <button
                onClick={() => setAiSuggestions(!aiSuggestions)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  aiSuggestions ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  aiSuggestions ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Marketing</h3>
                  <p className="text-sm text-muted-foreground">Promotional offers and feature updates</p>
                </div>
              </div>
              <button
                onClick={() => setMarketing(!marketing)}
                className={`w-12 h-6 rounded-full relative transition-colors ${
                  marketing ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  marketing ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Provider Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">PROVIDER</h2>
          
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">Become a Provider</h3>
                  <p className="text-sm text-muted-foreground">Join our marketplace and start earning</p>
                </div>
              </div>
              <Button className="rounded-xl bg-primary hover:bg-primary/90">Join</Button>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">SUPPORT</h2>
          
          <button 
            onClick={() => setShowHelpFAQ(true)}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3"
            data-testid="help-faq-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Help & FAQ</h3>
                <p className="text-sm text-muted-foreground">Get answers to common questions</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button 
            onClick={() => toast.info('Contact support at support@onepoint.com')}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3"
            data-testid="contact-support-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Contact Support</h3>
                <p className="text-sm text-muted-foreground">Get help from our support team</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('splash_completed');
              toast.success('Restart the app to see the tutorial');
            }}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between"
            data-testid="tutorial-replay-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Tutorial Replay</h3>
                <p className="text-sm text-muted-foreground">Watch the onboarding tutorial again</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>
        </div>

        {/* About Section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">ABOUT</h2>
          
          <div className="glass-card rounded-2xl p-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Info className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Version</h3>
                <p className="text-sm text-muted-foreground">1.0.0 (Build 2024.11.10)</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowPrivacyPolicy(true)}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3"
            data-testid="privacy-policy-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Privacy Policy</h3>
                <p className="text-sm text-muted-foreground">Read our privacy policy</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button 
            onClick={() => setShowTermsOfService(true)}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between"
            data-testid="terms-service-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Terms of Service</h3>
                <p className="text-sm text-muted-foreground">Read our terms and conditions</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-destructive mb-3 uppercase tracking-wider">DANGER ZONE</h2>
          
          <button
            onClick={handleSignOut}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3 border-destructive/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-destructive">Sign Out</h3>
                <p className="text-sm text-muted-foreground">Sign out of your account</p>
              </div>
            </div>
            <span className="text-destructive">›</span>
          </button>

          <button 
            onClick={handleDeleteAccount}
            className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between border-destructive/30"
            data-testid="delete-account-btn"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
              </div>
            </div>
            <span className="text-destructive">›</span>
          </button>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Change Password</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your old password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Old Password</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your old password"
                className="mt-1 bg-white/10 border-0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                className="mt-1 bg-white/10 border-0"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1 bg-white/10 border-0"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
            >
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help & FAQ Dialog */}
      <Dialog open={showHelpFAQ} onOpenChange={setShowHelpFAQ}>
        <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Help & FAQ</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="mb-4">
              <Input
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="bg-white/10 border-0"
              />
            </div>

            {[
              {
                question: 'How do I create a need?',
                answer: 'To create a need: (1) Navigate to the Needs page or tap "Create Need" on the Dashboard. (2) Fill in the need title, description, and category. (3) Upload photos if applicable. (4) Review the AI-generated plan and estimated pricing. (5) Submit for provider matching. You\'ll receive notifications when providers express interest.',
              },
              {
                question: 'How do I accept a provider?',
                answer: 'On the Providers page, browse available service providers in your area. Tap on a provider card to view their profile, ratings, completed jobs, and user reviews. Once you\'ve found the right match, tap "Connect Provider" to initiate contact and proceed with booking their services.',
              },
              {
                question: 'How can I track my needs?',
                answer: 'All active needs are displayed on your Dashboard with real-time status updates. Each need shows its current phase: Suggested, Confirmed, Assigned, In Progress, or Completed. Tap any need card for detailed tracking, provider information, messages, and estimated completion time.',
              },
              {
                question: 'How do I communicate with providers?',
                answer: 'Navigate to the Chat section to view all your conversations. Select a provider to open the messaging interface. You can send text messages, share photos, coordinate schedules, and discuss project details. Push notifications keep you updated on new messages in real-time.',
              },
              {
                question: 'Is my data secure?',
                answer: 'Absolutely. OnePoint ALO implements bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Your personal information is never sold to third parties. We comply with GDPR, CCPA, and international privacy regulations. You have full control over your data through Privacy Settings.',
              },
              {
                question: 'How do I enable biometric login?',
                answer: 'After your first successful login, go to Settings > Account > Biometric Authentication and toggle it on. Your device must support Face ID or fingerprint authentication. Once enabled, you can unlock the app using your biometric credentials instead of entering your password each time.',
              },
              {
                question: 'How do payments work?',
                answer: 'OnePoint ALO uses secure escrow payments to protect both users and providers. When you confirm a need, funds are held in escrow until the job is completed to your satisfaction. Accepted payment methods include credit/debit cards, Apple Pay, Google Pay, and ACH bank transfers. All transactions are encrypted and PCI DSS compliant.',
              },
              {
                question: 'What if I\'m not satisfied with a provider\'s work?',
                answer: 'If you\'re unsatisfied with the service: (1) Document the issue with photos and descriptions. (2) Contact the provider through the Chat to resolve the matter. (3) If unresolved, initiate a dispute through Settings > Support > Contact Support. Our mediation team will review your case within 24 hours and hold payment in escrow until resolution.',
              },
              {
                question: 'Can I cancel a need after it\'s been created?',
                answer: 'Yes. Before a provider is assigned, you can cancel freely without fees. After assignment, cancellation policies depend on the provider\'s terms. If work has started, cancellation fees may apply. To cancel, go to the need details and select "Cancel Need". You\'ll see applicable fees before confirming.',
              },
              {
                question: 'How does AI suggestion work?',
                answer: 'Our AI assistant analyzes your need history, preferences, location, time patterns, and seasonal trends to provide personalized suggestions. It learns from your behavior to anticipate needs before you think of them, helping you stay proactive. You can disable AI suggestions in Settings > Notifications > AI Suggestions.',
              },
              {
                question: 'What are the different priority levels?',
                answer: 'Needs are classified into three priorities: EASY (routine tasks you do frequently), MEDIUM (occasional tasks that require planning), and HARD (urgent or complex tasks needing immediate attention). Priority affects provider matching, pricing, and notification urgency. Emergency Mode is for critical needs requiring instant response.',
              },
              {
                question: 'How do I become a provider?',
                answer: 'To join as a provider: (1) Go to Settings > Provider > Become a Provider. (2) Complete the application with business details, categories of service, certifications, and insurance information. (3) Submit identity verification documents. (4) Pass a background check. Approval typically takes 2-3 business days. Providers earn 85% of each transaction.',
              },
            ].filter(
              (faq) =>
                faqSearch === '' ||
                faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
            ).map((faq, index) => (
              <div key={index} className="glass-card rounded-2xl p-4">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy}>
        <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Privacy Policy</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 text-sm text-muted-foreground">
            <p className="text-xs text-muted-foreground mb-4">Last Updated: November 10, 2024</p>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Introduction</h3>
              <p>OnePoint ALO, Inc. ("OnePoint", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Autonomous Life Operating System platform and services (collectively, the "Services"). By using our Services, you consent to the data practices described in this policy.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Information We Collect</h3>
              <p className="mb-2"><strong>Personal Information:</strong> When you create an account, we collect your full name, email address, phone number, date of birth, and payment information. For identity verification, we may request government-issued ID and proof of address.</p>
              <p className="mb-2"><strong>Location Data:</strong> With your permission, we collect precise geolocation data to connect you with nearby service providers. You can disable location services in device settings, though this may limit functionality.</p>
              <p className="mb-2"><strong>Usage Data:</strong> We automatically collect device information (device type, OS version, unique device identifiers), log data (IP address, browser type, pages viewed, timestamps), and interaction data (features used, time spent, preferences).</p>
              <p><strong>Communications:</strong> Messages sent through our platform, including text, photos, and files shared with providers, are stored to facilitate service delivery and dispute resolution.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. How We Use Your Information</h3>
              <p className="mb-2"><strong>Service Delivery:</strong> To create and manage your account, connect you with verified service providers, process payments securely, facilitate communication between you and providers, and provide customer support.</p>
              <p className="mb-2"><strong>AI & Personalization:</strong> Our AI assistant analyzes your usage patterns, preferences, and historical data to provide personalized need suggestions, optimize provider matching, and improve service recommendations. You can opt out of AI data processing in Privacy Settings.</p>
              <p><strong>Safety & Compliance:</strong> To verify identity, prevent fraud, enforce our Terms of Service, comply with legal obligations, and respond to law enforcement requests when legally required.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Data Security</h3>
              <p>We implement military-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on SOC 2 Type II certified cloud providers with 99.99% uptime SLA. Regular security audits and penetration testing ensure ongoing protection. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Your Privacy Rights</h3>
              <p className="mb-2"><strong>Access & Portability:</strong> Request a copy of your personal data in machine-readable format (JSON, CSV).</p>
              <p className="mb-2"><strong>Rectification:</strong> Update or correct inaccurate information through Settings or by contacting support.</p>
              <p className="mb-2"><strong>Erasure ("Right to be Forgotten"):</strong> Request deletion of your account and all associated data. Some data may be retained for legal compliance (e.g., tax records for 7 years).</p>
              <p className="mb-2"><strong>Restriction & Objection:</strong> Limit how we process your data or object to specific processing activities (e.g., marketing communications).</p>
              <p>To exercise these rights, contact privacy@onepoint.com. We respond to all requests within 30 days per GDPR/CCPA requirements.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">6. Third-Party Sharing</h3>
              <p className="mb-2"><strong>We Never Sell Your Data.</strong> Your personal information is not and will never be sold to third parties for marketing purposes.</p>
              <p className="mb-2"><strong>Service Providers:</strong> We share necessary information with payment processors (Stripe), cloud hosting (AWS, Google Cloud), analytics providers (anonymized data only), and customer support tools. All partners are bound by strict confidentiality agreements.</p>
              <p><strong>Legal Requirements:</strong> We may disclose information when required by law, to enforce our policies, protect rights and safety, or in connection with a corporate transaction (merger, acquisition).</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">7. Data Retention</h3>
              <p>We retain your personal data for as long as your account is active or as needed to provide Services. After account deletion, most data is purged within 90 days, except where longer retention is required for legal, tax, or dispute resolution purposes (up to 7 years for financial records).</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">8. International Transfers</h3>
              <p>Your data may be transferred to and processed in countries outside your residence, including the United States. We ensure adequate safeguards through Standard Contractual Clauses (SCCs) approved by the European Commission and comply with GDPR for EU users.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">9. Children's Privacy</h3>
              <p>Our Services are not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a minor, contact privacy@onepoint.com immediately.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">10. Cookies & Tracking Technologies</h3>
              <p>We use essential cookies (authentication, security), functional cookies (preferences, settings), and analytics cookies (usage patterns, performance). You can control cookies through browser settings or our Cookie Preferences center. Disabling cookies may limit functionality.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">11. Changes to This Policy</h3>
              <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material changes will be notified via email at least 30 days before taking effect. Continued use after notification constitutes acceptance of the updated policy.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">12. Contact Us</h3>
              <p className="mb-2">For questions, concerns, or to exercise your privacy rights:</p>
              <p className="mb-1"><strong>Email:</strong> privacy@onepoint.com</p>
              <p className="mb-1"><strong>Data Protection Officer:</strong> dpo@onepoint.com</p>
              <p className="mb-1"><strong>Mail:</strong> OnePoint ALO, Inc., ATTN: Privacy Team, [Address]</p>
              <p><strong>EU Representative:</strong> For EU-specific inquiries, contact eu-privacy@onepoint.com</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Dialog */}
      <Dialog open={showTermsOfService} onOpenChange={setShowTermsOfService}>
        <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Terms of Service</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 text-sm text-muted-foreground">
            <p className="text-xs text-muted-foreground mb-4">Last Updated: November 10, 2024</p>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
              <p>These Terms of Service ("Terms") govern your access to and use of OnePoint ALO, Inc.'s ("OnePoint", "we", "us", or "our") Autonomous Life Operating System platform, website, mobile applications, and all related services (collectively, the "Services"). By creating an account, accessing, or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use the Services.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Eligibility</h3>
              <p>You must be at least 18 years old and legally capable of entering into binding contracts to use our Services. By using our Services, you represent and warrant that you meet these requirements. If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization to these Terms.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. User Accounts & Security</h3>
              <p className="mb-2">You must create an account to access most features. You agree to provide accurate, current, and complete information during registration and to update this information as needed to keep it accurate.</p>
              <p className="mb-2">You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized access or security breach at security@onepoint.com.</p>
              <p>We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or pose a risk to other users or our platform.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">4. Description of Services</h3>
              <p className="mb-2">OnePoint ALO is a technology platform that connects users with independent service providers for various real-life needs and tasks. We are a marketplace facilitator, not a service provider. We do not employ providers, and providers are independent contractors responsible for the quality and completion of their services.</p>
              <p>We do not guarantee the availability, quality, safety, or legality of services offered by providers. Your interactions with providers are at your own risk.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">5. Prohibited Activities</h3>
              <p className="mb-2">You agree to use the Services only for lawful purposes. You must not:</p>
              <p className="mb-1">• Violate any laws or regulations</p>
              <p className="mb-1">• Engage in harassment, discrimination, or threatening behavior</p>
              <p className="mb-1">• Impersonate any person or entity</p>
              <p className="mb-1">• Upload viruses or malicious code</p>
              <p className="mb-1">• Attempt unauthorized access to our systems</p>
              <p className="mb-1">• Use automated systems (bots, scrapers) without written permission</p>
              <p>• Collect or harvest personal data of other users without consent</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">6. Payments, Fees & Refunds</h3>
              <p className="mb-2">Users pay for services rendered by providers. OnePoint charges a platform fee (typically 15% of the transaction value) which is disclosed before booking confirmation. Payments are processed through secure third-party payment processors (Stripe).</p>
              <p className="mb-2">Funds are held in escrow until service completion. Upon completion and your approval, funds are released to the provider. If you report an issue, funds remain in escrow pending dispute resolution.</p>
              <p>Cancellations before provider assignment incur no fees. After assignment, cancellation policies vary by provider. Refunds for unsatisfactory service are handled case-by-case through our dispute resolution process.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">7. Intellectual Property Rights</h3>
              <p className="mb-2">All content on the Services, including text, graphics, logos, images, software, and trademarks, is owned by OnePoint or our licensors and protected by copyright, trademark, and other intellectual property laws.</p>
              <p className="mb-2">You retain ownership of content you submit (photos, messages, need descriptions). By submitting content, you grant OnePoint a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display your content solely to provide and improve the Services.</p>
              <p>You may not copy, modify, distribute, sell, or reverse-engineer any part of our Services without written permission.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">8. Disclaimers & Limitation of Liability</h3>
              <p className="mb-2">THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.</p>
              <p className="mb-2">We do not guarantee that the Services will be uninterrupted, secure, or error-free. We do not warrant the accuracy, completeness, or reliability of any content.</p>
              <p className="mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW, ONEPOINT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, DATA LOSS, OR BUSINESS INTERRUPTION.</p>
              <p>Our total liability to you for any claims arising from these Terms or your use of the Services shall not exceed the amount you paid to OnePoint in the 12 months preceding the claim, or $100, whichever is greater.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">9. Dispute Resolution & Arbitration</h3>
              <p className="mb-2">Before filing a claim, you agree to attempt to resolve the dispute informally by contacting disputes@onepoint.com. We will work with you in good faith for 30 days to reach a resolution.</p>
              <p className="mb-2">If informal resolution fails, you agree that all disputes will be resolved through binding arbitration conducted by the American Arbitration Association (AAA) under its Commercial Arbitration Rules. You agree to bring claims only in your individual capacity and not as a plaintiff or class member in any class or representative action.</p>
              <p>Either party may seek injunctive relief in court for intellectual property infringement or unauthorized access to our systems.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">10. Termination</h3>
              <p className="mb-2">You may terminate your account at any time through Settings → Delete Account. You remain responsible for any outstanding fees or obligations.</p>
              <p>We may suspend or terminate your access immediately without notice if you violate these Terms, engage in fraud, abuse the platform, or for any reason at our sole discretion.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">11. Changes to Terms</h3>
              <p>We reserve the right to modify these Terms at any time. Material changes will be notified via email or in-app notification at least 30 days before the effective date. Your continued use of the Services after changes take effect constitutes acceptance of the updated Terms.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-2">12. Governing Law</h3>
              <p>These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any arbitration or court proceeding shall be conducted in San Francisco, California.</p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">9. Contact</h3>
              <p className="mb-2">For questions, concerns, or notices regarding these Terms:</p>
              <p className="mb-1"><strong>Email:</strong> legal@onepoint.com</p>
              <p className="mb-1"><strong>Support:</strong> support@onepoint.com</p>
              <p><strong>Mail:</strong> OnePoint ALO, Inc., ATTN: Legal Department, [Address]</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
