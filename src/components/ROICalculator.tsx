
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HelpCircle, Download, Calendar, TrendingUp, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface CalculationResults {
  currentRevenue: number;
  currentDisplayRevenue: number;
  currentVideoRevenue: number;
  currentRetargetingRevenue: number;
  
  projectedRevenue: number;
  projectedDisplayRevenue: number;
  projectedVideoRevenue: number;
  projectedRetargetingRevenue: number;
  
  incrementalRevenue: number;
  incrementalPercentage: number;
  
  conversionImprovements: {
    displayImprovement: number;
    videoImprovement: number;
    retargetingImprovement: number;
  };
}

const ROICalculator = () => {
  const [annualRevenue, setAnnualRevenue] = useState<string>('5000000');
  const [chromePercentage, setChromePercentage] = useState<number[]>([55]); // Changed from nonChromePercentage
  const [displayShare, setDisplayShare] = useState<number[]>([60]);
  const [videoShare, setVideoShare] = useState<number[]>([25]);
  const [retargetingShare, setRetargetingShare] = useState<number[]>([15]);
  const [performanceCampaignPercentage, setPerformanceCampaignPercentage] = useState<number[]>([70]);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Constants
  const BASELINE_DISPLAY_CR = 2.58; // 2.58%
  const BASELINE_VIDEO_CR = 4.17; // 4.17%
  const CAPI_CR_MULTIPLIER = 3; // CAPI triples conversion rates
  const CAPI_CTR_MULTIPLIER = 2; // CAPI doubles CTR for retargeting
  const CPM_INCREASE = 0.35; // 35% CPM increase

  const formatCurrencyInput = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Convert to number and format with commas
    if (numericValue === '') return '';
    
    const number = parseInt(numericValue);
    return new Intl.NumberFormat('en-US').format(number);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatCurrencyInput(inputValue);
    setAnnualRevenue(formattedValue);
  };

  const getNumericRevenue = () => {
    return parseInt(annualRevenue.replace(/[^\d]/g, '')) || 0;
  };

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    const numericRevenue = getNumericRevenue();
    if (!annualRevenue || numericRevenue <= 0) {
      newErrors.annualRevenue = 'Please enter a valid annual revenue amount';
    }
    
    if (displayShare[0] + videoShare[0] + retargetingShare[0] !== 100) {
      newErrors.shares = 'Revenue shares must add up to 100%';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateROI = () => {
    if (!validateInputs()) return;
    
    const revenue = getNumericRevenue();
    const nonChromePercent = (100 - chromePercentage[0]) / 100; // Calculate non-Chrome from Chrome percentage
    const displayPercent = displayShare[0] / 100;
    const videoPercent = videoShare[0] / 100;
    const retargetingPercent = retargetingShare[0] / 100;
    const performancePercent = performanceCampaignPercentage[0] / 100;
    
    // Current revenue breakdown
    const currentDisplayRevenue = revenue * displayPercent;
    const currentVideoRevenue = revenue * videoPercent;
    const currentRetargetingRevenue = revenue * retargetingPercent;
    
    // Calculate non-Chrome affected revenue (where CAPI provides benefit)
    const affectedDisplayRevenue = currentDisplayRevenue * nonChromePercent * performancePercent;
    const affectedVideoRevenue = currentVideoRevenue * nonChromePercent * performancePercent;
    const affectedRetargetingRevenue = currentRetargetingRevenue * nonChromePercent * performancePercent;
    
    // Calculate improvements with CAPI
    // For display and video: 3x conversion rate improvement
    const displayImprovement = affectedDisplayRevenue * (CAPI_CR_MULTIPLIER - 1);
    const videoImprovement = affectedVideoRevenue * (CAPI_CR_MULTIPLIER - 1);
    
    // For retargeting: 2x CTR improvement
    const retargetingImprovement = affectedRetargetingRevenue * (CAPI_CTR_MULTIPLIER - 1);
    
    // Apply CPM increase penalty (35% increase reduces net benefit)
    const cpmPenaltyFactor = 1 - (CPM_INCREASE * 0.7); // Reduce impact by 70% of CPM increase
    const netDisplayImprovement = displayImprovement * cpmPenaltyFactor;
    const netVideoImprovement = videoImprovement * cpmPenaltyFactor;
    const netRetargetingImprovement = retargetingImprovement * cpmPenaltyFactor;
    
    // Calculate projections
    const projectedDisplayRevenue = currentDisplayRevenue + netDisplayImprovement;
    const projectedVideoRevenue = currentVideoRevenue + netVideoImprovement;
    const projectedRetargetingRevenue = currentRetargetingRevenue + netRetargetingImprovement;
    
    const projectedRevenue = projectedDisplayRevenue + projectedVideoRevenue + projectedRetargetingRevenue;
    const incrementalRevenue = projectedRevenue - revenue;
    const incrementalPercentage = (incrementalRevenue / revenue) * 100;
    
    setResults({
      currentRevenue: revenue,
      currentDisplayRevenue,
      currentVideoRevenue,
      currentRetargetingRevenue,
      projectedRevenue,
      projectedDisplayRevenue,
      projectedVideoRevenue,
      projectedRetargetingRevenue,
      incrementalRevenue,
      incrementalPercentage,
      conversionImprovements: {
        displayImprovement: netDisplayImprovement,
        videoImprovement: netVideoImprovement,
        retargetingImprovement: netRetargetingImprovement,
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 1) => {
    return num.toFixed(decimals);
  };

  // Format Y-axis values to show in millions
  const formatYAxisCurrency = (value: number) => {
    const millions = value / 1000000;
    return `$${millions.toFixed(0)}M`;
  };

  const generatePDF = () => {
    if (!results) return;
    
    const pdf = new jsPDF();
    const date = new Date().toISOString().split('T')[0];
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AdFixus CAPI Revenue Impact Analysis', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Inputs
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Current Setup:', 20, 65);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Annual Revenue: ${formatCurrency(Number(annualRevenue))}`, 20, 80);
    pdf.text(`Chrome Inventory: ${chromePercentage[0]}%`, 20, 95); // Updated label
    pdf.text(`Performance Campaigns: ${performanceCampaignPercentage[0]}%`, 20, 110);
    pdf.text(`Display Share: ${displayShare[0]}% | Video Share: ${videoShare[0]}% | Retargeting: ${retargetingShare[0]}%`, 20, 125);
    
    // Results
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CAPI Impact Results:', 20, 150);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Incremental Annual Revenue: ${formatCurrency(results.incrementalRevenue)} (+${formatNumber(results.incrementalPercentage)}%)`, 20, 165);
    pdf.text(`Projected Total Revenue: ${formatCurrency(results.projectedRevenue)}`, 20, 180);
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Revenue Improvements by Channel:', 20, 205);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Display: ${formatCurrency(results.conversionImprovements.displayImprovement)}`, 20, 220);
    pdf.text(`Video: ${formatCurrency(results.conversionImprovements.videoImprovement)}`, 20, 235);
    pdf.text(`Retargeting: ${formatCurrency(results.conversionImprovements.retargetingImprovement)}`, 20, 250);
    
    pdf.save(`AdFixus_CAPI_Analysis_${date}.pdf`);
    
    toast({
      title: "PDF Generated!",
      description: "Your CAPI impact analysis has been downloaded.",
    });
  };

  const revenueChartData = results ? [
    { name: 'Current', value: results.currentRevenue, fill: '#94A3B8' },
    { name: 'With CAPI', value: results.projectedRevenue, fill: '#006073' },
  ] : [];

  const improvementData = results ? [
    { name: 'Display', value: results.conversionImprovements.displayImprovement, fill: '#00C7B1' },
    { name: 'Video', value: results.conversionImprovements.videoImprovement, fill: '#FF615A' },
    { name: 'Retargeting', value: results.conversionImprovements.retargetingImprovement, fill: '#8B5CF6' },
  ] : [];

  return (
    <TooltipProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#F7F9FA' }}>
        {/* Header */}
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/e05fe6e9-96d1-4dcc-9caa-0d7f03e785ed.png" 
                  alt="AdFixus" 
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            {/* Large Logo */}
            <div className="mb-8">
              <img 
                src="/lovable-uploads/6c4484f1-aec6-4c58-99b0-b901b4e0655a.png" 
                alt="AdFixus" 
                className="h-16 mx-auto"
              />
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#006073' }}>
              The industry's only deterministic<br />
              Open Web Conversion API
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how enabling CAPI for can transform your business with improved conversion rates, better targeting and deterministic outcomes measurement.
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="space-y-8">
            {/* Input Card - Centered */}
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#006073' }}>
                    <Target className="h-6 w-6" />
                    Your Revenue Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="revenue">Annual Revenue (excluding app inventory)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your total annual web-based advertising revenue</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                        $
                      </span>
                      <Input
                        id="revenue"
                        type="text"
                        value={annualRevenue}
                        onChange={handleRevenueChange}
                        placeholder="5,000,000"
                        className={`pl-8 ${errors.annualRevenue ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.annualRevenue && (
                      <p className="text-sm text-red-500 mt-1">{errors.annualRevenue}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Label>Chrome Inventory (%)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of your inventory from Chrome browsers (remaining percentage from Safari, Firefox, and other browsers will benefit from CAPI)</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="px-3">
                      <Slider
                        value={chromePercentage}
                        onValueChange={setChromePercentage}
                        max={80}
                        min={20}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>20%</span>
                        <span className="font-semibold" style={{ color: '#006073' }}>{chromePercentage[0]}%</span>
                        <span>80%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Label>% of campaigns that brief for a performance outcome</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Percentage of campaigns focused on performance metrics where CAPI benefits apply</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="px-3">
                      <Slider
                        value={performanceCampaignPercentage}
                        onValueChange={setPerformanceCampaignPercentage}
                        max={100}
                        min={30}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>30%</span>
                        <span className="font-semibold" style={{ color: '#006073' }}>{performanceCampaignPercentage[0]}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Label>Display (%)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Share of revenue from display advertising</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="px-3">
                        <Slider
                          value={displayShare}
                          onValueChange={(value) => {
                            setDisplayShare(value);
                            // Auto-adjust other shares to maintain 100%
                            const remaining = 100 - value[0];
                            const videoRatio = videoShare[0] / (videoShare[0] + retargetingShare[0]);
                            const newVideoShare = Math.max(0, Math.round(remaining * videoRatio));
                            const newRetargetingShare = Math.max(0, remaining - newVideoShare);
                            setVideoShare([newVideoShare]);
                            setRetargetingShare([newRetargetingShare]);
                          }}
                          max={80}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-semibold mt-1" style={{ color: '#006073' }}>
                          {displayShare[0]}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Label>Video (%)</Label>
                      </div>
                      <div className="px-3">
                        <Slider
                          value={videoShare}
                          onValueChange={(value) => {
                            setVideoShare(value);
                            const remaining = 100 - displayShare[0] - value[0];
                            setRetargetingShare([Math.max(0, remaining)]);
                          }}
                          max={60}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-semibold mt-1" style={{ color: '#006073' }}>
                          {videoShare[0]}%
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Label>Retargeting (%)</Label>
                      </div>
                      <div className="px-3">
                        <Slider
                          value={retargetingShare}
                          onValueChange={(value) => {
                            setRetargetingShare(value);
                            const remaining = 100 - displayShare[0] - value[0];
                            setVideoShare([Math.max(0, remaining)]);
                          }}
                          max={40}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                        <div className="text-center text-sm font-semibold mt-1" style={{ color: '#006073' }}>
                          {retargetingShare[0]}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {errors.shares && (
                    <p className="text-sm text-red-500 text-center">{errors.shares}</p>
                  )}

                  <Button 
                    onClick={calculateROI}
                    className="w-full text-white font-semibold py-3"
                    style={{ backgroundColor: '#00C7B1' }}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Calculate CAPI Impact
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results Card */}
            {results && (
              <div className="max-w-2xl mx-auto">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2" style={{ color: '#006073' }}>
                      <TrendingUp className="h-6 w-6" />
                      Your CAPI Revenue Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                        <p className="text-sm text-gray-600">Incremental Annual Revenue</p>
                        <p className="text-2xl font-bold" style={{ color: '#006073' }}>
                          {formatCurrency(results.incrementalRevenue)}
                        </p>
                        <p className="text-sm font-medium" style={{ color: '#00C7B1' }}>
                          +{formatNumber(results.incrementalPercentage)}%
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                        <p className="text-sm text-gray-600">Projected Total Revenue</p>
                        <p className="text-2xl font-bold" style={{ color: '#006073' }}>
                          {formatCurrency(results.projectedRevenue)}
                        </p>
                      </div>
                      
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                        <p className="text-sm text-gray-600">Performance Campaigns</p>
                        <p className="text-2xl font-bold" style={{ color: '#006073' }}>
                          {performanceCampaignPercentage[0]}%
                        </p>
                        <p className="text-sm text-gray-500">eligible for CAPI</p>
                      </div>
                      
                      <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                        <p className="text-sm text-gray-600">Revenue Uplift</p>
                        <p className="text-2xl font-bold" style={{ color: '#00C7B1' }}>
                          {formatNumber(results.incrementalPercentage)}%
                        </p>
                        <p className="text-sm text-gray-500">improvement</p>
                      </div>
                    </div>

                    {/* Revenue Comparison Chart */}
                    <div className="h-64">
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#006073' }}>
                        Revenue Comparison
                      </h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={formatYAxisCurrency} />
                          <Bar 
                            dataKey="value" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Channel Improvements */}
                    <div className="mt-12">
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#006073' }}>
                        Revenue Improvements by Channel
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                          <p className="text-sm text-gray-600 mb-1">Display</p>
                          <p className="font-semibold" style={{ color: '#00C7B1' }}>
                            {formatCurrency(results.conversionImprovements.displayImprovement)}
                          </p>
                          <p className="text-xs text-gray-500">3x conversion rate</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#FFF5F5' }}>
                          <p className="text-sm text-gray-600 mb-1">Video</p>
                          <p className="font-semibold" style={{ color: '#FF615A' }}>
                            {formatCurrency(results.conversionImprovements.videoImprovement)}
                          </p>
                          <p className="text-xs text-gray-500">3x conversion rate</p>
                        </div>
                        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F3E8FF' }}>
                          <p className="text-sm text-gray-600 mb-1">Retargeting</p>
                          <p className="font-semibold" style={{ color: '#8B5CF6' }}>
                            {formatCurrency(results.conversionImprovements.retargetingImprovement)}
                          </p>
                          <p className="text-xs text-gray-500">2x CTR improvement</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={generatePDF}
                      className="w-full text-white font-semibold py-3"
                      style={{ backgroundColor: '#FF615A' }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Impact Analysis
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#006073' }}>
                  Ready to create an industry-leading ad product?
                </h2>
                <p className="text-gray-600 mb-6">
                  Book a 15-minute working session with our team to discuss your CAPI implementation strategy.
                </p>
                <Button 
                  className="text-white font-semibold px-8 py-3"
                  style={{ backgroundColor: '#00C7B1' }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book a 15-min Working Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ROICalculator;
