import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { loginFormSchema, signupFormSchema, validateAndSanitizeForm } from '@/utils/validators';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '' 
  });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Handle account lockout
  useEffect(() => {
    if (isLocked) {
      const timer = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked]);

  // Check for account lock from localStorage
  useEffect(() => {
    const lockData = localStorage.getItem('accountLock');
    if (lockData) {
      const { until } = JSON.parse(lockData);
      const now = new Date().getTime();
      if (until > now) {
        setIsLocked(true);
        setLockTime(Math.floor((until - now) / 1000));
      } else {
        localStorage.removeItem('accountLock');
      }
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      toast({
        title: 'Account Temporarily Locked',
        description: `Too many failed attempts. Please try again in ${lockTime} seconds.`,
        variant: 'destructive',
      });
      return;
    }

    // Clear previous errors
    setLoginErrors({});
    
    // Validate form
    const validation = validateAndSanitizeForm(loginFormSchema, loginForm);
    
    if (!validation.isValid) {
      setLoginErrors(validation.errors || {});
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(validation.data!.email, validation.data!.password);

      if (error) {
        // Increment login attempts
        const attempts = loginAttempts + 1;
        setLoginAttempts(attempts);

        // Check if should lock account (5 failed attempts)
        if (attempts >= 5) {
          const lockDuration = 60; // 60 seconds
          const lockUntil = new Date().getTime() + (lockDuration * 1000);
          
          localStorage.setItem('accountLock', JSON.stringify({ until: lockUntil }));
          
          setIsLocked(true);
          setLockTime(lockDuration);
          setLoginAttempts(0);
          
          toast({
            title: 'Account Temporarily Locked',
            description: `Too many failed attempts. Please try again in ${lockDuration} seconds.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Login Failed',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        setLoginAttempts(0);
        navigate('/');
      }
    } catch (err: any) {
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setSignupErrors({});
    
    // Validate form
    const validation = validateAndSanitizeForm(signupFormSchema, signupForm);
    
    if (!validation.isValid) {
      setSignupErrors(validation.errors || {});
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(
        validation.data!.email, 
        validation.data!.password, 
        validation.data!.firstName, 
        validation.data!.lastName
      );

      if (error) {
        toast({
          title: 'Signup Failed',
          description: error.message,
          variant: 'destructive',
        });
        setSignupErrors({ form: error.message });
      } else {
        toast({
          title: 'Account Created!',
          description: 'Please check your email to verify your account.',
        });
        // Reset form after successful signup
        setSignupForm({ email: '', password: '', firstName: '', lastName: '' });
      }
    } catch (err: any) {
      toast({
        title: 'Signup Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: 'Google Sign In Failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Google Sign In Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  // Helper to render field error message
  const FieldError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return <p className="text-destructive text-sm mt-1">{error}</p>;
  };

  // Password strength indicator
  const PasswordStrengthIndicator = ({ password }: { password: string }) => {
    // If password is empty, don't show indicator
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const getStrengthText = () => {
      if (strength <= 2) return 'Weak';
      if (strength <= 4) return 'Medium';
      return 'Strong';
    };
    
    const getStrengthColor = () => {
      if (strength <= 2) return 'bg-red-500';
      if (strength <= 4) return 'bg-yellow-500';
      return 'bg-green-500';
    };
    
    return (
      <div className="mt-1">
        <div className="flex justify-between items-center">
          <div className="h-1 w-full bg-gray-200 rounded-full">
            <div 
              className={`h-1 rounded-full ${getStrengthColor()}`} 
              style={{ width: `${(strength / 5) * 100}%` }}
            />
          </div>
          <span className="text-xs ml-2">{getStrengthText()}</span>
        </div>
      </div>
    );
  };

  // Form-level error alert
  const FormError = ({ error }: { error?: string }) => {
    if (!error) return null;
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Golf Tournament Tracker</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full" 
                  disabled={googleLoading || loading || isLocked}
                >
                  {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue with Google
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {isLocked && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Account temporarily locked. Please try again in {lockTime} seconds.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      aria-invalid={!!loginErrors.email}
                      disabled={isLocked}
                    />
                    <FieldError error={loginErrors.email} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      aria-invalid={!!loginErrors.password}
                      disabled={isLocked}
                    />
                    <FieldError error={loginErrors.password} />
                  </div>
                  <FormError error={loginErrors.form} />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading || googleLoading || isLocked}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full" 
                  disabled={googleLoading || loading}
                >
                  {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue with Google
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <Input
                        id="signup-firstname"
                        placeholder="John"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        required
                        aria-invalid={!!signupErrors.firstName}
                      />
                      <FieldError error={signupErrors.firstName} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        placeholder="Doe"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                        required
                        aria-invalid={!!signupErrors.lastName}
                      />
                      <FieldError error={signupErrors.lastName} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                      aria-invalid={!!signupErrors.email}
                    />
                    <FieldError error={signupErrors.email} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                      aria-invalid={!!signupErrors.password}
                    />
                    <PasswordStrengthIndicator password={signupForm.password} />
                    <FieldError error={signupErrors.password} />
                  </div>
                  <FormError error={signupErrors.form} />
                  <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/quick-login')}
          className="text-muted-foreground hover:text-golf-green"
        >
          Quick Login for Bandon Dunes Tournament →
        </Button>
      </div>
    </div>
  );
};

export default Auth;