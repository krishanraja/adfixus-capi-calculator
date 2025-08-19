import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Zap, Target } from 'lucide-react';
import { formatCurrencyInput } from '@/utils/formatting';
import type { ValidationErrors } from '@/types/roi';

interface ROIInputFormProps {
  annualRevenue: string;
  onAnnualRevenueChange: (value: string) => void;
  chromePercentage: number[];
  onChromePercentageChange: (value: number[]) => void;
  displayShare: number[];
  onDisplayShareChange: (value: number[]) => void;
  videoShare: number[];
  onVideoShareChange: (value: number[]) => void;
  performanceCampaignPercentage: number[];
  onPerformanceCampaignPercentageChange: (value: number[]) => void;
  errors: ValidationErrors;
  onCalculateClick: () => void;
}

export function ROIInputForm({
  annualRevenue,
  onAnnualRevenueChange,
  chromePercentage,
  onChromePercentageChange,
  displayShare,
  onDisplayShareChange,
  videoShare,
  onVideoShareChange,
  performanceCampaignPercentage,
  onPerformanceCampaignPercentageChange,
  errors,
  onCalculateClick
}: ROIInputFormProps) {
  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatCurrencyInput(inputValue);
    onAnnualRevenueChange(formattedValue);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-brand-primary">
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
                  <p>An estimate of your annual web-based ad revenue.</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Label>Display (%)</Label>
              </div>
              <div className="px-3">
                <Slider
                  value={displayShare}
                  onValueChange={onDisplayShareChange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm font-semibold mt-1 text-brand-primary">
                  {displayShare[0]}%
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Label>Web Video (%)</Label>
              </div>
              <div className="px-3">
                <Slider
                  value={videoShare}
                  onValueChange={onVideoShareChange}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm font-semibold mt-1 text-brand-primary">
                  {videoShare[0]}%
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Label>Chrome Inventory (%)</Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>An estimate of what % Chrome inventory makes up of your total.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="px-3">
              <Slider
                value={chromePercentage}
                onValueChange={onChromePercentageChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-semibold text-brand-primary">{chromePercentage[0]}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Label>% of campaigns that are remarketing + conversion optimized</Label>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add up your % of remarketing campaigns and % of conversion-optimized campaigns to get a rough estimate of campaigns eligible for CAPI benefits.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="px-3">
              <Slider
                value={performanceCampaignPercentage}
                onValueChange={onPerformanceCampaignPercentageChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>0%</span>
                <span className="font-semibold text-brand-primary">{performanceCampaignPercentage[0]}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {errors.shares && (
            <p className="text-sm text-red-500 text-center">{errors.shares}</p>
          )}

          <Button 
            onClick={onCalculateClick}
            className="w-full text-white font-semibold py-3 bg-brand-secondary hover:bg-brand-secondary/90"
          >
            <Zap className="w-4 h-4 mr-2" />
            Calculate CAPI Impact
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}