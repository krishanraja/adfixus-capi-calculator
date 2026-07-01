import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import type { SalesPlanInputs } from '@/hooks/useSalesPlan';
import type { RiskScenario } from '@/core';
import { formatCurrency } from '@/utils/formatting';

interface InputsPanelProps {
  inputs: SalesPlanInputs;
  update: <K extends keyof SalesPlanInputs>(key: K, value: SalesPlanInputs[K]) => void;
}

interface SliderRowProps {
  label: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

const SliderRow = ({ label, tooltip, value, min, max, step, display, onChange }: SliderRowProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </Label>
      <span className="text-sm font-semibold text-primary tabular-nums">{display}</span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
    />
  </div>
);

export const InputsPanel = ({ inputs, update }: InputsPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Revenue basis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Your business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Revenue basis</Label>
            <ToggleGroup
              type="single"
              value={inputs.revenueMode}
              onValueChange={(v) => v && update('revenueMode', v as SalesPlanInputs['revenueMode'])}
              className="justify-start"
            >
              <ToggleGroupItem value="portfolio" className="text-xs px-4">
                Portfolio revenue
              </ToggleGroupItem>
              <ToggleGroupItem value="traffic" className="text-xs px-4">
                Traffic + CPM
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {inputs.revenueMode === 'portfolio' ? (
            <SliderRow
              label="Annual portfolio revenue"
              tooltip="Your total annual advertising revenue across all properties."
              value={inputs.portfolioRevenue}
              min={5_000_000}
              max={500_000_000}
              step={5_000_000}
              display={formatCurrency(inputs.portfolioRevenue)}
              onChange={(v) => update('portfolioRevenue', v)}
            />
          ) : (
            <>
              <SliderRow
                label="Monthly pageviews"
                value={inputs.monthlyPageviews}
                min={5_000_000}
                max={1_000_000_000}
                step={5_000_000}
                display={`${(inputs.monthlyPageviews / 1_000_000).toFixed(0)}M`}
                onChange={(v) => update('monthlyPageviews', v)}
              />
              <SliderRow
                label="Display CPM"
                value={inputs.displayCPM}
                min={1}
                max={20}
                step={0.5}
                display={`$${inputs.displayCPM.toFixed(2)}`}
                onChange={(v) => update('displayCPM', v)}
              />
              <SliderRow
                label="Video CPM"
                value={inputs.videoCPM}
                min={4}
                max={40}
                step={1}
                display={`$${inputs.videoCPM.toFixed(2)}`}
                onChange={(v) => update('videoCPM', v)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* CAPI campaign economics */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">CAPI campaign economics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SliderRow
            label="Avg campaign spend"
            tooltip="Typical advertiser spend per campaign booked on your properties."
            value={inputs.avgCampaignSpend}
            min={25_000}
            max={1_000_000}
            step={25_000}
            display={formatCurrency(inputs.avgCampaignSpend)}
            onChange={(v) => update('avgCampaignSpend', v)}
          />

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="text-sm">Let readiness drive campaign volume</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Derive yearly campaigns from your business-readiness scores.
              </p>
            </div>
            <Switch
              checked={inputs.useReadinessForCampaigns}
              onCheckedChange={(v) => update('useReadinessForCampaigns', v)}
            />
          </div>

          {!inputs.useReadinessForCampaigns && (
            <SliderRow
              label="Yearly CAPI campaigns"
              tooltip="Number of CAPI-enabled campaigns you expect to run per year."
              value={inputs.yearlyCampaigns}
              min={2}
              max={60}
              step={1}
              display={`${inputs.yearlyCampaigns}`}
              onChange={(v) => update('yearlyCampaigns', v)}
            />
          )}

          <SliderRow
            label="CAPI line-item share"
            tooltip="Share of campaign spend delivered on CAPI-enabled line items."
            value={inputs.capiLineItemShare}
            min={0.2}
            max={1}
            step={0.05}
            display={`${Math.round(inputs.capiLineItemShare * 100)}%`}
            onChange={(v) => update('capiLineItemShare', v)}
          />

          <SliderRow
            label="Revenue-share / service fee"
            tooltip="Share of CAPI incremental revenue taken as a service fee."
            value={inputs.serviceFee}
            min={0.05}
            max={0.2}
            step={0.005}
            display={`${(inputs.serviceFee * 100).toFixed(1)}%`}
            onChange={(v) => update('serviceFee', v)}
          />

          <SliderRow
            label="Improved match rate"
            tooltip="Match rate achievable with a durable ID + CAPI (baseline is 30%)."
            value={inputs.matchRateImproved}
            min={0.5}
            max={0.95}
            step={0.01}
            display={`${Math.round(inputs.matchRateImproved * 100)}%`}
            onChange={(v) => update('matchRateImproved', v)}
          />
        </CardContent>
      </Card>

      {/* Business readiness */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Business readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SliderRow
            label="Sales team readiness"
            tooltip="Training, incentives and active pipeline for outcome-based selling."
            value={inputs.salesReadiness}
            min={0.4}
            max={1}
            step={0.05}
            display={`${Math.round(inputs.salesReadiness * 100)}%`}
            onChange={(v) => update('salesReadiness', v)}
          />
          <SliderRow
            label="Training & enablement"
            value={inputs.trainingGaps}
            min={0.4}
            max={1}
            step={0.05}
            display={`${Math.round(inputs.trainingGaps * 100)}%`}
            onChange={(v) => update('trainingGaps', v)}
          />
          <SliderRow
            label="Advertiser buy-in"
            value={inputs.advertiserBuyIn}
            min={0.4}
            max={1}
            step={0.05}
            display={`${Math.round(inputs.advertiserBuyIn * 100)}%`}
            onChange={(v) => update('advertiserBuyIn', v)}
          />
          <SliderRow
            label="Market conditions"
            value={inputs.marketConditions}
            min={0.6}
            max={1}
            step={0.05}
            display={`${Math.round(inputs.marketConditions * 100)}%`}
            onChange={(v) => update('marketConditions', v)}
          />

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Risk scenario</Label>
            <ToggleGroup
              type="single"
              value={inputs.risk}
              onValueChange={(v) => v && update('risk', v as RiskScenario)}
              className="justify-start"
            >
              <ToggleGroupItem value="conservative" className="text-xs px-3">
                Conservative
              </ToggleGroupItem>
              <ToggleGroupItem value="moderate" className="text-xs px-3">
                Moderate
              </ToggleGroupItem>
              <ToggleGroupItem value="optimistic" className="text-xs px-3">
                Optimistic
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
