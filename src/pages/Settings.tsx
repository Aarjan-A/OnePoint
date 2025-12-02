
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Fingerprint, MapPin, Brain, MessageSquare, Snowflake, Bell, Megaphone, Briefcase, HelpCircle, Phone, PlayCircle, Info, Shield, FileText, LogOut, Trash2, Camera } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || '');
      setUserName(user.displayName || user.metadata?.fullName || 'User');

      // Check biometric support
      const biometricAvailable = localStorage.getItem('biometric_enabled') === 'true';
      setBiometricEnabled(biometricAvailable);
    }
  }, [user]);

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

          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3">
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
          
          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-semibold text-foreground">Theme</h3>
                <p className="text-sm text-muted-foreground">Follow system settings</p>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </button>

          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between">
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
          
          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3">
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

          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3">
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

          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between">
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

          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between mb-3">
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

          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between">
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

          <button className="glass-card-hover rounded-2xl p-4 w-full flex items-center justify-between border-destructive/30">
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
    </div>
  );
}
