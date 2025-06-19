
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { HelpCircle, Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface CalculationResults {
  baselineRevenue: number;
  upliftRevenue: number;
  incrementalRevenue: number;
  incrementalPercentage: number;
  incrementalRevenue12m: number;
  paybackWeeks: number;
  roi12m: number;
}

const ROICalculator = () => {
  const [impressions, setImpressions] = useState<string>('25000000');
  const [cpm, setCpm] = useState<string>('3.20');
  const [cpmLift, setCpmLift] = useState<number[]>([15]);
  const [inventoryGain, setInventoryGain] = useState<number[]>([40]);
  const [implementationCost, setImplementationCost] = useState<string>('25000');
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    if (!impressions || isNaN(Number(impressions)) || Number(impressions) <= 0) {
      newErrors.impressions = 'Please enter a valid number of impressions';
    }
    
    if (!cpm || isNaN(Number(cpm)) || Number(cpm) <= 0) {
      newErrors.cpm = 'Please enter a valid CPM amount';
    }
    
    if (!implementationCost || isNaN(Number(implementationCost)) || Number(implementationCost) < 0) {
      newErrors.implementationCost = 'Please enter a valid implementation cost';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateROI = () => {
    if (!validateInputs()) return;
    
    const impressionsNum = Number(impressions);
    const cpmNum = Number(cpm);
    const cpmLiftPercent = cpmLift[0] / 100;
    const inventoryGainPercent = inventoryGain[0] / 100;
    const implementationCostNum = Number(implementationCost);
    
    const baselineRevenue = (impressionsNum / 1000) * cpmNum;
    const upliftedImpressions = impressionsNum * (1 + inventoryGainPercent);
    const upliftedCPM = cpmNum * (1 + cpmLiftPercent);
    const upliftRevenue = (upliftedImpressions / 1000) * upliftedCPM;
    const incrementalRevenue = upliftRevenue - baselineRevenue;
    const incrementalPercentage = (incrementalRevenue / baselineRevenue) * 100;
    const incrementalRevenue12m = incrementalRevenue * 12;
    const paybackWeeks = (implementationCostNum / incrementalRevenue) * 4.345;
    const roi12m = ((incrementalRevenue12m - implementationCostNum) / implementationCostNum) * 100;
    
    setResults({
      baselineRevenue,
      upliftRevenue,
      incrementalRevenue,
      incrementalPercentage,
      incrementalRevenue12m,
      paybackWeeks,
      roi12m
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

  const generatePDF = () => {
    if (!results) return;
    
    const pdf = new jsPDF();
    const date = new Date().toISOString().split('T')[0];
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('AdFixus CAPI ROI Analysis', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
    
    // Inputs
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Input Parameters:', 20, 65);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Monthly Addressable Impressions: ${Number(impressions).toLocaleString()}`, 20, 80);
    pdf.text(`Average Open-Web CPM: ${formatCurrency(Number(cpm))}`, 20, 95);
    pdf.text(`Expected CPM Lift: ${cpmLift[0]}%`, 20, 110);
    pdf.text(`Expected Inventory Gain: ${inventoryGain[0]}%`, 20, 125);
    pdf.text(`Implementation Cost: ${formatCurrency(Number(implementationCost))}`, 20, 140);
    
    // Results
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ROI Analysis Results:', 20, 165);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Incremental Monthly Revenue: ${formatCurrency(results.incrementalRevenue)} (+${formatNumber(results.incrementalPercentage)}%)`, 20, 180);
    pdf.text(`12-Month Incremental Revenue: ${formatCurrency(results.incrementalRevenue12m)}`, 20, 195);
    pdf.text(`Payback Period: ${formatNumber(results.paybackWeeks)} weeks`, 20, 210);
    pdf.text(`ROI at 12 Months: ${formatNumber(results.roi12m)}%`, 20, 225);
    
    // Footer
    pdf.setFontSize(10);
    pdf.text('This analysis is based on your specific inputs and AdFixus CAPI performance benchmarks.', 20, 270);
    pdf.text('Contact AdFixus for a detailed implementation discussion.', 20, 280);
    
    pdf.save(`AdFixus_CAPI_ROI_${date}.pdf`);
    
    toast({
      title: "PDF Generated!",
      description: "Your ROI analysis has been downloaded.",
    });
  };

  const chartData = results ? [
    {
      name: 'Current Revenue',
      value: results.baselineRevenue,
    },
    {
      name: 'With AdFixus',
      value: results.upliftRevenue,
    },
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
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#006073' }}>
              The industry's only deterministic open-web Conversion API
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plug and play, yours to own and with 100% addressability and cross-domain stitching. See how much revenue you can claim back below.
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl" style={{ color: '#006073' }}>
                  Your Current Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="impressions">Monthly Addressable Impressions</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total monthly ad impressions your property can serve</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="impressions"
                    type="text"
                    value={impressions}
                    onChange={(e) => setImpressions(e.target.value)}
                    placeholder="25,000,000"
                    className={errors.impressions ? 'border-red-500' : ''}
                  />
                  {errors.impressions && (
                    <p className="text-sm text-red-500 mt-1">{errors.impressions}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="cpm">Average Open-Web CPM ($)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Current cost per thousand impressions you're achieving</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="cpm"
                    type="text"
                    value={cpm}
                    onChange={(e) => setCpm(e.target.value)}
                    placeholder="3.20"
                    className={errors.cpm ? 'border-red-500' : ''}
                  />
                  {errors.cpm && (
                    <p className="text-sm text-red-500 mt-1">{errors.cpm}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Label>Expected CPM Lift (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>CPM improvement from better signal quality (typical: 10-25%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={cpmLift}
                      onValueChange={setCpmLift}
                      max={50}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>5%</span>
                      <span className="font-semibold" style={{ color: '#006073' }}>{cpmLift[0]}%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Label>Expected Inventory Gain (%)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Additional monetizable inventory from improved matching (typical: 30-50%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={inventoryGain}
                      onValueChange={setInventoryGain}
                      max={80}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>10%</span>
                      <span className="font-semibold" style={{ color: '#006073' }}>{inventoryGain[0]}%</span>
                      <span>80%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Label htmlFor="cost">Implementation Cost ($)</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>One-time setup and integration costs</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id="cost"
                    type="text"
                    value={implementationCost}
                    onChange={(e) => setImplementationCost(e.target.value)}
                    placeholder="25,000"
                    className={errors.implementationCost ? 'border-red-500' : ''}
                  />
                  {errors.implementationCost && (
                    <p className="text-sm text-red-500 mt-1">{errors.implementationCost}</p>
                  )}
                </div>

                <Button 
                  onClick={calculateROI}
                  className="w-full text-white font-semibold py-3"
                  style={{ backgroundColor: '#00C7B1' }}
                >
                  Calculate ROI
                </Button>
              </CardContent>
            </Card>

            {/* Results Card */}
            {results && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl" style={{ color: '#006073' }}>
                    Your AdFixus Upside
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                      <p className="text-sm text-gray-600">Incremental Monthly Revenue</p>
                      <p className="text-2xl font-bold" style={{ color: '#006073' }}>
                        {formatCurrency(results.incrementalRevenue)}
                      </p>
                      <p className="text-sm font-medium" style={{ color: '#00C7B1' }}>
                        +{formatNumber(results.incrementalPercentage)}%
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                      <p className="text-sm text-gray-600">12-Month Revenue Gain</p>
                      <p className="text-2xl font-bold" style={{ color: '#006073' }}>
                        {formatCurrency(results.incrementalRevenue12m)}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF5F5' }}>
                      <p className="text-sm text-gray-600">Payback Period</p>
                      <p className="text-2xl font-bold" style={{ color: '#FF615A' }}>
                        {formatNumber(results.paybackWeeks)}
                      </p>
                      <p className="text-sm text-gray-500">weeks</p>
                    </div>
                    
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDFC' }}>
                      <p className="text-sm text-gray-600">ROI at 12 Months</p>
                      <p className="text-2xl font-bold" style={{ color: '#006073' }}>
                        {formatNumber(results.roi12m)}%
                      </p>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-64">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#006073' }}>
                      Before vs After AdFixus
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Bar 
                          dataKey="value" 
                          fill="#006073"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <Button
                    onClick={generatePDF}
                    className="w-full text-white font-semibold py-3"
                    style={{ backgroundColor: '#FF615A' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Business Case
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto shadow-lg border-0">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#006073' }}>
                  Ready to unlock this revenue?
                </h2>
                <p className="text-gray-600 mb-6">
                  Book a 15-minute working session with our team to discuss your specific implementation.
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
