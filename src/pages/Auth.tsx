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
        
        // Navigate to stored redirect path or dashboard
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/dashboard');
        }
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
        
        // Navigate to stored redirect path or dashboard
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          navigate('/dashboard');
        }
        
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-xl sm:text-2xl text-center font-bold">BetLoopr</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 sm:h-11">
              <TabsTrigger value="login" className="text-sm sm:text-base">Login</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm sm:text-base">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full h-10 sm:h-11 text-sm sm:text-base" 
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

                <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-sm">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      aria-invalid={!!loginErrors.email}
                      disabled={isLocked}
                      className="h-10 sm:h-11"
                    />
                    <FieldError error={loginErrors.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-password" className="text-sm">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      aria-invalid={!!loginErrors.password}
                      disabled={isLocked}
                      className="h-10 sm:h-11"
                    />
                    <FieldError error={loginErrors.password} />
                  </div>
                  <FormError error={loginErrors.form} />
                  <Button 
                    type="submit" 
                    className="w-full h-10 sm:h-11" 
                    disabled={loading || googleLoading || isLocked}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
              <div className="space-y-3 sm:space-y-4">
                <Button 
                  onClick={handleGoogleSignIn} 
                  variant="outline" 
                  className="w-full h-10 sm:h-11 text-sm sm:text-base" 
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

                <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-firstname" className="text-sm">First Name</Label>
                      <Input
                        id="signup-firstname"
                        placeholder="John"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        required
                        aria-invalid={!!signupErrors.firstName}
                        className="h-10 sm:h-11"
                      />
                      <FieldError error={signupErrors.firstName} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-lastname" className="text-sm">Last Name</Label>
                      <Input
                        id="signup-lastname"
                        placeholder="Doe"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                        required
                        aria-invalid={!!signupErrors.lastName}
                        className="h-10 sm:h-11"
                      />
                      <FieldError error={signupErrors.lastName} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-sm">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                      aria-invalid={!!signupErrors.email}
                      className="h-10 sm:h-11"
                    />
                    <FieldError error={signupErrors.email} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-sm">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                      aria-invalid={!!signupErrors.password}
                      className="h-10 sm:h-11"
                    />
                    <PasswordStrengthIndicator password={signupForm.password} />
                    <FieldError error={signupErrors.password} />
                  </div>
                  <FormError error={signupErrors.form} />
                  <Button type="submit" className="w-full h-10 sm:h-11" disabled={loading || googleLoading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-4 sm:mt-6 text-center w-full max-w-md px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/quick-login')}
          className="text-sm sm:text-base text-muted-foreground hover:text-emerald-600 w-full sm:w-auto"
        >
          Quick Login for Bandon Dunes →
        </Button>
      </div>
    </div>
  );
};

export default Auth;