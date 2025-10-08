import React, { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { validateAndSanitizeForm, loginFormSchema, signupFormSchema } from '@/utils/validators';

interface InlineAuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const InlineAuthSheet: React.FC<InlineAuthSheetProps> = ({ isOpen, onClose, onAuthSuccess }) => {
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
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    
    const validation = validateAndSanitizeForm(loginFormSchema, loginForm);
    if (!validation.isValid) {
      setLoginErrors(validation.errors || {});
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(validation.data!.email, validation.data!.password);
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Creating your tournament...',
        });
        onAuthSuccess();
      }
    } catch (err) {
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
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
      } else {
        toast({
          title: 'Account Created!',
          description: 'Creating your tournament...',
        });
        onAuthSuccess();
      }
    } catch (err) {
      toast({
        title: 'Signup Error',
        description: 'An unexpected error occurred.',
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
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      toast({
        title: 'Google Sign In Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const FieldError = ({ error }: { error?: string }) => 
    error ? <p className="text-destructive text-sm mt-1">{error}</p> : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Sign in to create your tournament</SheetTitle>
          <SheetDescription>
            Your tournament configuration is ready. Sign in or create an account to save it and invite players.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-4">
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
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inline-login-email">Email</Label>
                    <Input
                      id="inline-login-email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                    <FieldError error={loginErrors.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inline-login-password">Password</Label>
                    <Input
                      id="inline-login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                    <FieldError error={loginErrors.password} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In & Create Tournament
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-4">
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
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inline-signup-firstname">First Name</Label>
                      <Input
                        id="inline-signup-firstname"
                        value={signupForm.firstName}
                        onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                        required
                      />
                      <FieldError error={signupErrors.firstName} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inline-signup-lastname">Last Name</Label>
                      <Input
                        id="inline-signup-lastname"
                        value={signupForm.lastName}
                        onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                        required
                      />
                      <FieldError error={signupErrors.lastName} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inline-signup-email">Email</Label>
                    <Input
                      id="inline-signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                    <FieldError error={signupErrors.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inline-signup-password">Password</Label>
                    <Input
                      id="inline-signup-password"
                      type="password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                    <FieldError error={signupErrors.password} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading || googleLoading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account & Tournament
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};
