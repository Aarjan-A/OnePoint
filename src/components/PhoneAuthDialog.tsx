import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PhoneAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function PhoneAuthDialog({ open, onOpenChange, onSuccess }: PhoneAuthDialogProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    // Simulate OTP send - in production, integrate with Twilio/AWS SNS
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast.success(`OTP sent to ${phoneNumber}`);
    }, 1500);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    // Simulate OTP verification - in production, verify with backend
    setTimeout(() => {
      setLoading(false);
      toast.success('Phone verified successfully!');
      onSuccess();
      onOpenChange(false);
      // Reset state
      setStep('phone');
      setPhoneNumber('');
      setOtp('');
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary" />
            Phone Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 'phone' ? (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="glass-card border-border/50 focus:border-primary h-12 text-lg"
                maxLength={10}
              />
              <p className="text-sm text-muted-foreground">
                We'll send you a verification code
              </p>
            </div>

            <Button
              onClick={handleSendOTP}
              disabled={loading || phoneNumber.length < 10}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-semibold"
            >
              {loading ? 'Sending...' : 'Send OTP'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-base font-semibold text-foreground">
                  {phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '+1 ($1) $2-$3')}
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="glass-card w-12 h-14 text-lg" />
                    <InputOTPSlot index={1} className="glass-card w-12 h-14 text-lg" />
                    <InputOTPSlot index={2} className="glass-card w-12 h-14 text-lg" />
                    <InputOTPSlot index={3} className="glass-card w-12 h-14 text-lg" />
                    <InputOTPSlot index={4} className="glass-card w-12 h-14 text-lg" />
                    <InputOTPSlot index={5} className="glass-card w-12 h-14 text-lg" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-base font-semibold"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
                <CheckCircle className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="ghost"
                onClick={() => setStep('phone')}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Use different number
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={handleSendOTP}
                className="text-sm text-primary hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
