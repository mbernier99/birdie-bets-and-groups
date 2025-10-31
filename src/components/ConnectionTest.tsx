import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, Database, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Capacitor } from '@capacitor/core';

interface TestResult {
  name: string;
  status: 'idle' | 'testing' | 'passed' | 'failed';
  message: string;
  icon: React.ReactNode;
}

export const ConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Authentication', status: 'idle', message: 'Not tested', icon: <Wifi className="h-4 w-4" /> },
    { name: 'Database', status: 'idle', message: 'Not tested', icon: <Database className="h-4 w-4" /> },
    { name: 'GPS Permissions', status: 'idle', message: 'Not tested', icon: <MapPin className="h-4 w-4" /> },
  ]);

  const updateResult = (index: number, status: TestResult['status'], message: string) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, status, message } : r));
  };

  const runTests = async () => {
    setTesting(true);

    // Test 1: Authentication Token Validity
    updateResult(0, 'testing', 'Checking...');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session) {
        const expiresAt = new Date(session.expires_at! * 1000);
        const minutesRemaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000 / 60);
        updateResult(0, 'passed', `Valid for ${minutesRemaining} minutes`);
      } else {
        updateResult(0, 'failed', 'No active session');
      }
    } catch (error: any) {
      updateResult(0, 'failed', error.message);
    }

    // Test 2: Database Connectivity
    updateResult(1, 'testing', 'Checking...');
    try {
      const { data, error } = await supabase.from('tournaments').select('id').limit(1);
      if (error) throw error;
      updateResult(1, 'passed', 'Connected successfully');
    } catch (error: any) {
      updateResult(1, 'failed', error.message);
    }

    // Test 3: GPS Permissions
    updateResult(2, 'testing', 'Checking...');
    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permissions = await Geolocation.checkPermissions();
        if (permissions.location === 'granted') {
          const position = await Geolocation.getCurrentPosition({ timeout: 5000 });
          updateResult(2, 'passed', `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
        } else {
          updateResult(2, 'failed', 'Permission not granted');
        }
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateResult(2, 'passed', `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          },
          (error) => {
            updateResult(2, 'failed', error.message);
          },
          { timeout: 5000 }
        );
      }
    } catch (error: any) {
      updateResult(2, 'failed', error.message);
    }

    setTesting(false);
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Testing</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not tested</Badge>;
    }
  };

  const allPassed = results.every(r => r.status === 'passed');
  const anyFailed = results.some(r => r.status === 'failed');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-Tournament Connection Test</CardTitle>
        <CardDescription>
          Run this test before starting your round to ensure everything is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {result.icon}
                <div>
                  <p className="font-medium text-sm">{result.name}</p>
                  <p className="text-xs text-gray-600">{result.message}</p>
                </div>
              </div>
              {getStatusBadge(result.status)}
            </div>
          ))}
        </div>

        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Connection Test'
          )}
        </Button>

        {allPassed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="font-medium text-green-900">All systems ready!</p>
            <p className="text-sm text-green-700">You're good to start your tournament</p>
          </div>
        )}

        {anyFailed && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="font-medium text-red-900">Some tests failed</p>
            <p className="text-sm text-red-700">Fix issues before starting tournament</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
