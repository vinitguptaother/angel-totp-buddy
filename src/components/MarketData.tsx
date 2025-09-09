import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Volume, Clock } from "lucide-react";

interface MarketDataProps {
  data: {
    symbol: string;
    lastTradedPrice: number;
    change: number;
    changePercent: number;
    volume: number;
    timestamp: string;
  };
}

export const MarketData = ({ data }: MarketDataProps) => {
  const isPositive = data.change >= 0;
  
  return (
    <div className="space-y-4">
      {/* Stock Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{data.symbol}</h3>
          <p className="text-sm text-muted-foreground">NSE Stock</p>
        </div>
        <Badge 
          className={`${
            isPositive 
              ? 'bg-success text-success-foreground' 
              : 'bg-destructive text-destructive-foreground'
          } flex items-center gap-1`}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
        </Badge>
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-trading-card border-trading-border">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Traded Price</p>
              <p className="text-2xl font-bold">₹{data.lastTradedPrice.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-trading-card border-trading-border">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Change</p>
              <p className={`text-2xl font-bold ${
                isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {isPositive ? '+' : ''}₹{data.change.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-trading-card border-trading-border">
          <CardContent className="p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Volume className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Volume</p>
              </div>
              <p className="text-2xl font-bold">
                {data.volume.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Last updated: {data.timestamp}</span>
      </div>

      {/* Success Message */}
      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
        <p className="text-success font-medium">✓ Successfully connected to Angel One API</p>
        <p className="text-sm text-muted-foreground mt-1">
          Market data retrieved using live session tokens
        </p>
      </div>
    </div>
  );
};