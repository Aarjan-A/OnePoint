
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Fingerprint, Mail, Lock, User, Phone, Apple } from 'lucide-react';
import { countryCodes } from '@/lib/countryCodes';
import ModernLogo from '@/components/ModernLogo';
import { blink } from '@/lib/supabase';

type AuthMode = 'start' | 'create-account' | 'login';
type SignUpMethod = 'email' | 'phone';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('start');
  const [signUpMethod, setSignUpMethod] = useState<SignUpMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpMethod === 'phone' && !showOtpInput) {
      // First step: Send OTP
      if (phoneNumber.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
      setLoading(true);
      // Simulate OTP sending (in production: integrate Twilio/AWS SNS)
      setTimeout(() => {
        setLoading(false);
        setShowOtpInput(true);
        const fullPhone = `${countryCode}${phoneNumber}`;
        toast.success(`OTP sent to ${fullPhone}`);
      }, 1500);
      return;
    }
    
    // Verify OTP if phone signup
    if (signUpMethod === 'phone' && showOtpInput) {
      if (otp.length !== 6) {
        toast.error('Please enter the 6-digit OTP');
        return;
      }
      setLoading(true);
      // Simulate OTP verification (in production: verify with backend)
      setTimeout(() => {
        handleSignUp();
      }, 1000);
      return;
    }
    
    // Email signup - proceed directly
    handleSignUp();
  };

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const finalEmail = signUpMethod === 'email' ? email : `${countryCode}${phoneNumber}@phone.local`;
      await signUp(finalEmail, password, fullName);
      // Store biometric preference and user info on first signup
      localStorage.setItem('biometric_available', 'true');
      localStorage.setItem('user_full_name', fullName);
      toast.success('Account created! Biometric authentication is now available.');
      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = () => {
    const hasBiometric = localStorage.getItem('biometric_available') === 'true';
    if (hasBiometric) {
      toast.info('Biometric login available - enable in Settings after login');
    } else {
      toast.info('Biometric authentication will be available after your first login');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // In production: implement Google OAuth via Blink SDK or Firebase
      const result = await blink.auth.signInWithGoogle?.();
      if (result) {
        toast.success('Logged in with Google!');
        navigate('/');
      } else {
        toast.info('Google login - Sign in with Google to continue');
      }
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      // In production: implement Apple OAuth via Blink SDK or Firebase
      const result = await blink.auth.signInWithApple?.();
      if (result) {
        toast.success('Logged in with Apple!');
        navigate('/');
      } else {
        toast.info('Apple login - Sign in with Apple ID to continue');
      }
    } catch (error: any) {
      toast.error(error.message || 'Apple login failed');
    } finally {
      setLoading(false);
    }
  };

  // Start Screen (Revolut-style)
  if (mode === 'start') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-between bg-black p-6">
        <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full">
          {/* Logo */}
          <div className="mb-8">
            <ModernLogo size={80} />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-3 text-center">
            OnePoint
          </h1>
          <p className="text-gray-400 text-center mb-12">
            Autonomous Life Operating System
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-md space-y-4">
          <Button
            onClick={() => setMode('create-account')}
            className="w-full h-14 rounded-2xl bg-white hover:bg-gray-100 text-black font-semibold text-lg shadow-xl"
            data-testid="create-account-btn"
          >
            Create Account
          </Button>
          
          <Button
            onClick={() => setMode('login')}
            variant="outline"
            className="w-full h-14 rounded-2xl bg-black/50 hover:bg-black/70 border-2 border-white/20 text-white font-semibold text-lg backdrop-blur-xl"
            data-testid="login-btn"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  // Create Account Screen
  if (mode === 'create-account') {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <button
            onClick={() => setMode('start')}
            className="text-gray-400 hover:text-white mb-6"
          >
            ← Back
          </button>

          <div className="flex justify-center mb-6">
            <ModernLogo size={64} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 text-center">Create Account</h2>
          <p className="text-gray-400 mb-8 text-center">Join OnePoint today</p>

          {/* Sign Up Method Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setSignUpMethod('email')}
              variant={signUpMethod === 'email' ? 'default' : 'outline'}
              className={`flex-1 h-12 rounded-xl ${
                signUpMethod === 'email' 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-black/50 border-white/20 hover:bg-black/70'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button
              onClick={() => setSignUpMethod('phone')}
              variant={signUpMethod === 'phone' ? 'default' : 'outline'}
              className={`flex-1 h-12 rounded-xl ${
                signUpMethod === 'phone' 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-black/50 border-white/20 hover:bg-black/70'
              }`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </Button>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500"
                data-testid="signup-fullname-input"
              />
            </div>

            {signUpMethod === 'email' ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500"
                  data-testid="signup-email-input"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <p className="text-xs text-gray-400 mb-2">You'll receive an OTP (One-Time Password) to verify your number</p>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={showOtpInput}>
                    <SelectTrigger className="w-[120px] bg-white/10 border-0 focus:ring-1 focus:ring-primary h-14 rounded-xl text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50 max-h-[300px]">
                      {countryCodes.map((country, index) => (
                        <SelectItem key={index} value={country.code}>
                          {country.flag} {country.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="123-456-7890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={showOtpInput}
                    className="flex-1 bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500"
                    data-testid="signup-phone-input"
                  />
                </div>
                
                {showOtpInput && (
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="otp" className="text-white">Enter OTP</Label>
                    <p className="text-xs text-gray-400 mb-2">Enter the 6-digit code sent to your phone</p>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      required
                      className="bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500 text-center tracking-widest text-2xl font-bold"
                      data-testid="signup-otp-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowOtpInput(false);
                        setOtp('');
                        toast.info('Enter a different phone number');
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Use different number
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500"
                data-testid="signup-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg mt-6"
              data-testid="signup-submit-btn"
            >
              {loading ? (signUpMethod === 'phone' && !showOtpInput ? 'Sending OTP...' : 'Creating Account...') : (signUpMethod === 'phone' && !showOtpInput ? 'Send OTP' : signUpMethod === 'phone' && showOtpInput ? 'Verify & Create Account' : 'Create Account')}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-primary font-semibold hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setMode('start')}
          className="text-gray-400 hover:text-white mb-6"
        >
          ← Back
        </button>

        <div className="flex justify-center mb-6">
          <ModernLogo size={64} />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome Back</h2>
        <p className="text-gray-400 mb-8 text-center">Log in to your account</p>

        {/* Quick Login Options */}
        <div className="space-y-3 mb-8">
          <Button
            onClick={handleBiometric}
            className="w-full h-14 rounded-2xl bg-black/50 hover:bg-black/70 border-2 border-white/20 text-white font-semibold backdrop-blur-xl"
            data-testid="biometric-login-btn"
          >
            <Fingerprint className="w-5 h-5 mr-2" />
            Use Biometric
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="h-12 rounded-xl bg-white hover:bg-gray-100 border-2 border-gray-200 text-gray-700 backdrop-blur-xl transition-all"
              title="Sign in with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="ml-2 text-sm font-semibold">Google</span>
            </Button>
            <Button
              onClick={handleAppleLogin}
              disabled={loading}
              className="h-12 rounded-xl bg-black hover:bg-gray-900 border-2 border-gray-800 text-white backdrop-blur-xl transition-all"
              title="Sign in with Apple"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="ml-2 text-sm font-semibold">Apple</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-500">Or log in with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-login" className="text-white">Email Address</Label>
            <Input
              id="email-login"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500"
              data-testid="login-email-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-login" className="text-white">Password</Label>
            <Input
              id="password-login"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500"
              data-testid="login-password-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg mt-6"
            data-testid="login-submit-btn"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => setMode('create-account')}
            className="text-primary font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>

        <p className="text-center text-xs text-gray-500 mt-8">
          Privacy-first by design. Your data stays yours.
        </p>
      </div>
    </div>
  );
}
