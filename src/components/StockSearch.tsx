import { useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Stock {
  symbol: string;
  token: string;
  name: string;
  exchange: string;
}

interface StockSearchProps {
  onSelectStock: (stock: Stock) => void;
  selectedStock: Stock | null;
}

const popularStocks: Stock[] = [
  { symbol: "RELIANCE-EQ", token: "2885", name: "Reliance Industries", exchange: "NSE" },
  { symbol: "TCS-EQ", token: "11536", name: "Tata Consultancy Services", exchange: "NSE" },
  { symbol: "INFY-EQ", token: "1594", name: "Infosys Limited", exchange: "NSE" },
  { symbol: "HDFCBANK-EQ", token: "1333", name: "HDFC Bank", exchange: "NSE" },
  { symbol: "ICICIBANK-EQ", token: "4963", name: "ICICI Bank", exchange: "NSE" },
  { symbol: "HINDUNILVR-EQ", token: "356", name: "Hindustan Unilever", exchange: "NSE" },
  { symbol: "ITC-EQ", token: "424", name: "ITC Limited", exchange: "NSE" },
  { symbol: "SBIN-EQ", token: "3045", name: "State Bank of India", exchange: "NSE" },
  { symbol: "BHARTIARTL-EQ", token: "10604", name: "Bharti Airtel", exchange: "NSE" },
  { symbol: "KOTAKBANK-EQ", token: "1922", name: "Kotak Mahindra Bank", exchange: "NSE" },
];

export const StockSearch = ({ onSelectStock, selectedStock }: StockSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = popularStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search stocks (e.g., RELIANCE, TCS, INFY...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {selectedStock && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedStock.symbol}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedStock.exchange}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">Selected</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{selectedStock.name}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {filteredStocks.map((stock) => (
          <Card 
            key={stock.token}
            className={`cursor-pointer transition-all hover:bg-accent/50 ${
              selectedStock?.token === stock.token ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelectStock(stock)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{stock.symbol}</div>
                  <div className="text-xs text-muted-foreground">{stock.name}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {stock.exchange}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredStocks.length === 0 && searchTerm && (
        <div className="text-center py-4 text-muted-foreground">
          <p>No stocks found for "{searchTerm}"</p>
          <p className="text-sm">Try searching for popular stocks like RELIANCE, TCS, or INFY</p>
        </div>
      )}
    </div>
  );
};