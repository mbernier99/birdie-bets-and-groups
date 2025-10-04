import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { runAllBetResolutionTests, verifyHandicapCalculations } from '@/utils/betResolutionTests';

/**
 * Debug component to test and verify bet resolution logic
 * Use this component during development to ensure all calculations are correct
 */
const BetResolutionDebug: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [handicapResults, setHandicapResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    
    // Run bet resolution tests
    const betTests = runAllBetResolutionTests();
    setTestResults(betTests);
    
    // Run handicap verification
    const hcpTests = verifyHandicapCalculations();
    setHandicapResults(hcpTests);
    
    setIsRunning(false);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bug className="h-6 w-6 text-slate-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Bet Resolution QA</h2>
            <p className="text-sm text-slate-600">Verify calculations & logic</p>
          </div>
        </div>
        <Button
          onClick={runTests}
          disabled={isRunning}
          className="gap-2"
        >
          <Play className="h-4 w-4" />
          Run All Tests
        </Button>
      </div>

      {/* Bet Resolution Tests */}
      {testResults && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2">
            <div>
              <h3 className="font-semibold text-slate-900">Bet Resolution Tests</h3>
              <p className="text-sm text-slate-600">
                {testResults.passed} passed, {testResults.failed} failed of {testResults.totalTests}
              </p>
            </div>
            <Badge
              variant={testResults.failed === 0 ? "default" : "destructive"}
              className="text-base px-4 py-2"
            >
              {testResults.failed === 0 ? '✓ All Passed' : `${testResults.failed} Failed`}
            </Badge>
          </div>

          <div className="space-y-2">
            {testResults.results.map((result: any, idx: number) => (
              <Collapsible key={idx}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {result.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium text-left">{result.scenario}</span>
                    </div>
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="ml-8 p-3 bg-slate-50 rounded-lg border text-sm">
                    <pre className="whitespace-pre-wrap text-slate-700">
                      {result.details}
                    </pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      )}

      {/* Handicap Tests */}
      {handicapResults && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2">
            <div>
              <h3 className="font-semibold text-slate-900">Handicap Calculation Tests</h3>
              <p className="text-sm text-slate-600">
                {handicapResults.tests.filter((t: any) => t.passed).length} / {handicapResults.tests.length} passed
              </p>
            </div>
            <Badge
              variant={handicapResults.tests.every((t: any) => t.passed) ? "default" : "destructive"}
              className="text-base px-4 py-2"
            >
              {handicapResults.tests.every((t: any) => t.passed) ? '✓ All Passed' : 'Some Failed'}
            </Badge>
          </div>

          <div className="space-y-2">
            {handicapResults.tests.map((test: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {test.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">{test.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">
                    Expected: {test.expected}, Got: {test.actual}
                  </span>
                  <Badge variant={test.passed ? "default" : "destructive"}>
                    {test.passed ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!testResults && !handicapResults && (
        <div className="text-center py-12 text-slate-500">
          <Bug className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Click "Run All Tests" to verify bet resolution logic</p>
          <p className="text-sm mt-2">Tests will verify handicaps, wagers, and calculations</p>
        </div>
      )}
    </Card>
  );
};

export default BetResolutionDebug;
