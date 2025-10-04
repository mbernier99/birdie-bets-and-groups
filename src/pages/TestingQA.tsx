import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle, Play, Trophy, Calculator, DollarSign } from 'lucide-react';
import { 
  runAllBetResolutionTests, 
  verifyHandicapCalculations,
  verifyWagerTracking,
  type WagerTest 
} from '@/utils/betResolutionTests';
import MobileNavigation from '@/components/MobileNavigation';
import MobileHeader from '@/components/MobileHeader';

const TestingQA = () => {
  const [betResults, setBetResults] = useState<any>(null);
  const [handicapResults, setHandicapResults] = useState<any>(null);
  const [wagerResults, setWagerResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Run bet resolution tests
    const betTestResults = runAllBetResolutionTests();
    setBetResults(betTestResults);
    
    // Run handicap verification
    const handicapTestResults = verifyHandicapCalculations();
    setHandicapResults(handicapTestResults);
    
    // Run wager tracking tests
    const wagerTest: WagerTest = {
      userId: 'user1',
      bets: [
        { amount: 10, winnerId: 'user1', userId: 'user1' }, // Won $10
        { amount: 20, winnerId: 'user2', userId: 'user1' }, // Lost $20
        { amount: 15, winnerId: 'user1', userId: 'user1' }, // Won $15
        { amount: 5, winnerId: 'user1', userId: 'user1' },  // Won $5
        { amount: 10, winnerId: 'user3', userId: 'user1' }, // Lost $10
      ],
      expectedWon: 30,
      expectedLost: 30,
      expectedNet: 0
    };
    
    const wagerTestResults = verifyWagerTracking(wagerTest);
    setWagerResults(wagerTestResults);
    
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 pb-20 md:pb-0">
      <MobileHeader title="QA Testing" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-emerald-600" />
            Comprehensive QA Testing Suite
          </h1>
          <p className="text-gray-600">
            Validate bet resolution, handicap calculations, and wager tracking
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Run All Tests</CardTitle>
            <CardDescription>
              Execute comprehensive tests for all betting and scoring functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="w-full"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
          </CardContent>
        </Card>

        {(betResults || handicapResults || wagerResults) && (
          <Tabs defaultValue="bet-resolution" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bet-resolution" className="gap-2">
                <Trophy className="h-4 w-4" />
                Bet Resolution
              </TabsTrigger>
              <TabsTrigger value="handicaps" className="gap-2">
                <Calculator className="h-4 w-4" />
                Handicaps
              </TabsTrigger>
              <TabsTrigger value="wagers" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Wagers
              </TabsTrigger>
            </TabsList>

            {/* Bet Resolution Tests */}
            <TabsContent value="bet-resolution">
              {betResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Bet Resolution Tests</span>
                      <div className="flex gap-2">
                        <Badge variant={betResults.failed === 0 ? "default" : "destructive"}>
                          {betResults.passed}/{betResults.totalTests} Passed
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Testing bet resolution across all bet types and scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {betResults.results.map((result: any, index: number) => (
                        <Card key={index} className={result.passed ? 'border-emerald-200' : 'border-red-200'}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                  {result.passed ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  )}
                                  {result.scenario}
                                </CardTitle>
                              </div>
                              <Badge variant={result.passed ? "default" : "destructive"}>
                                {result.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto">
                              {result.details}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Handicap Tests */}
            <TabsContent value="handicaps">
              {handicapResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Handicap Calculation Tests</span>
                      <Badge variant={
                        handicapResults.tests.every((t: any) => t.passed) ? "default" : "destructive"
                      }>
                        {handicapResults.tests.filter((t: any) => t.passed).length}/{handicapResults.tests.length} Passed
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Verifying proportional handicap application
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {handicapResults.tests.map((test: any, index: number) => (
                        <Card key={index} className={test.passed ? 'border-emerald-200' : 'border-red-200'}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {test.passed ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-600" />
                                )}
                                <div>
                                  <p className="font-medium">{test.name}</p>
                                  <p className="text-sm text-gray-600">
                                    Expected: {test.expected} strokes | Actual: {test.actual} strokes
                                  </p>
                                </div>
                              </div>
                              <Badge variant={test.passed ? "default" : "destructive"}>
                                {test.passed ? 'PASS' : 'FAIL'}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Wager Tests */}
            <TabsContent value="wagers">
              {wagerResults && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Wager Tracking Tests</span>
                      <Badge variant={wagerResults.passed ? "default" : "destructive"}>
                        {wagerResults.passed ? 'PASS' : 'FAIL'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Verifying accurate wager tracking across multiple bets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-emerald-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Total Won
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-emerald-600">
                            ${wagerResults.actualWon}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Expected: ${wagerResults.actualWon}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="border-red-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Total Lost
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-red-600">
                            ${wagerResults.actualLost}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Expected: ${wagerResults.actualLost}
                          </p>
                        </CardContent>
                      </Card>

                      <Card className={wagerResults.actualNet >= 0 ? 'border-emerald-200' : 'border-red-200'}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-gray-600">
                            Net Position
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className={`text-2xl font-bold ${
                            wagerResults.actualNet >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            ${wagerResults.actualNet >= 0 ? '+' : ''}{wagerResults.actualNet}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Expected: ${wagerResults.actualNet >= 0 ? '+' : ''}{wagerResults.actualNet}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {!wagerResults.passed && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-red-900">Test Failed</p>
                            <p className="text-sm text-red-700 mt-1">
                              Wager calculations do not match expected values. Review the wager tracking logic.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!betResults && !handicapResults && !wagerResults && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Click "Run All Tests" to start comprehensive QA testing
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileNavigation />
    </div>
  );
};

export default TestingQA;
