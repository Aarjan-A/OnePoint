
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Fingerprint, Mail, Lock, User, Phone, Apple, Chrome } from 'lucide-react';
import { countryCodes } from '@/lib/countryCodes';
import ModernLogo from '@/components/ModernLogo';

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
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(email, password, fullName);
      toast.success('Account created! Please check your email to verify.');
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
    toast.info('Biometric authentication will be available after first login');
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon!`);
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

          <form onSubmit={handleSignUp} className="space-y-4">
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
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
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
                    className="flex-1 bg-white/10 border-0 focus-visible:ring-1 focus-visible:ring-primary h-14 rounded-xl text-base text-white placeholder:text-gray-500"
                    data-testid="signup-phone-input"
                  />
                </div>
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
              {loading ? 'Creating Account...' : 'Create Account'}
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
              onClick={() => handleSocialLogin('Google')}
              className="h-12 rounded-xl bg-black/50 hover:bg-black/70 border-2 border-white/20 text-white backdrop-blur-xl"
            >
              <Chrome className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => handleSocialLogin('Apple')}
              className="h-12 rounded-xl bg-black/50 hover:bg-black/70 border-2 border-white/20 text-white backdrop-blur-xl"
            >
              <Apple className="w-5 h-5" />
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
