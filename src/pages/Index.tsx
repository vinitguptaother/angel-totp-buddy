import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Shield, TrendingUp, Wifi, WifiOff, Clock, Search } from "lucide-react";
import { CredentialsForm } from "@/components/CredentialsForm";
import { TotpTestForm } from "@/components/TotpTestForm";
import { MarketData } from "@/components/MarketData";
import { StockSearch } from "@/components/StockSearch";
import { useToast } from "@/hooks/use-toast";

type ConnectionStatus = "disconnected" | "connected" | "pending" | "error";

interface Credentials {
  apiKey: string;
  clientId: string;
  mpin: string;
  totpSecret?: string;
}

interface SessionTokens {
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
}

interface Stock {
  symbol: string;
  token: string;
  name: string;
  exchange: string;
}

const STORAGE_KEY = 'angelone_credentials';

const Index = () => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [sessionTokens, setSessionTokens] = useState<SessionTokens | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(true);
  const [marketData, setMarketData] = useState<any>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>({
    symbol: "RELIANCE-EQ",
    token: "2885", 
    name: "Reliance Industries",
    exchange: "NSE"
  });
  const { toast } = useToast();

  // Load credentials from localStorage on app startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const creds = JSON.parse(stored);
        setCredentials(creds);
        setIsCredentialsOpen(false); // Close credentials section if found
      }
    } catch (error) {
      console.error('Failed to load credentials from storage:', error);
    }
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-status-connected text-white";
      case "pending":
        return "bg-status-pending text-warning-foreground";
      case "error":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-status-disconnected text-white";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "pending":
        return "Connecting...";
      case "error":
        return "Error";
      default:
        return "Not Connected";
    }
  };

  const handleCredentialsSave = (creds: Credentials) => {
    setCredentials(creds);
    setIsCredentialsOpen(false);
    toast({
      title: "Credentials Saved",
      description: "Your Angel One API credentials have been stored locally for testing.",
    });
  };

  const handleClearStorage = () => {
    setCredentials(null);
    setSessionTokens(null);
    setConnectionStatus("disconnected");
    setMarketData(null);
    setIsCredentialsOpen(true);
    toast({
      title: "Storage Cleared",
      description: "All stored credentials and session data have been cleared.",
    });
  };

  const handleTotpLogin = async (totpCode: string) => {
    if (!credentials) {
      toast({
        title: "Error",
        description: "Please save your credentials first.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus("pending");
    
    try {
      // Angel One MPIN Login API call
      const loginResponse = await fetch('https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByMpin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-UserType': 'USER',
          'X-SourceID': 'WEB',
          'X-ClientLocalIP': '192.168.1.1',
          'X-ClientPublicIP': '106.193.147.98',
          'X-MACAddress': '00:00:00:00:00:00',
          'X-PrivateKey': credentials.apiKey
        },
        body: JSON.stringify({
          clientcode: credentials.clientId,
          mpin: credentials.mpin,
          totp: totpCode
        })
      });

      const loginData = await loginResponse.json();

      if (loginData.status && loginData.data) {
        const tokens: SessionTokens = {
          jwtToken: loginData.data.jwtToken,
          refreshToken: loginData.data.refreshToken,
          feedToken: loginData.data.feedToken,
        };
        
        setSessionTokens(tokens);
        setConnectionStatus("connected");

        // Fetch live market data for selected stock
        if (selectedStock) {
          const marketResponse = await fetch('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLTP', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-UserType': 'USER',
              'X-SourceID': 'WEB',
              'X-ClientLocalIP': '192.168.1.1',
              'X-ClientPublicIP': '106.193.147.98',
              'X-MACAddress': '00:00:00:00:00:00',
              'X-PrivateKey': credentials.apiKey,
              'Authorization': `Bearer ${tokens.jwtToken}`
            },
            body: JSON.stringify({
              exchange: selectedStock.exchange,
              tradingsymbol: selectedStock.symbol,
              symboltoken: selectedStock.token
            })
          });

          const marketData = await marketResponse.json();
          
          if (marketData.status && marketData.data) {
            const ltp = marketData.data.ltp;
            const formattedData = {
              symbol: selectedStock.symbol.replace('-EQ', ''),
              lastTradedPrice: ltp,
              change: 0, // Calculate based on previous close if available
              changePercent: 0,
              volume: 0,
              timestamp: new Date().toLocaleTimeString(),
            };
            
            setMarketData(formattedData);
          }
        }
        
        toast({
          title: "Login Successful",
          description: "Successfully connected to Angel One API and fetched live market data.",
        });
      } else {
        throw new Error(loginData.message || 'Login failed');
      }
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid TOTP code or connection error. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-trading-bg p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Angel One API Integration</h1>
          </div>
          <p className="text-muted-foreground">
            Secure TOTP Login & Live Market Data Testing
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge className={`${getStatusColor()} flex items-center gap-1`}>
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
        </div>

        {/* Credentials Section */}
        <Card className="bg-trading-card border-trading-border">
          <Collapsible open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-trading-border/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Angel One Credentials
                    </CardTitle>
                    <CardDescription>
                      {credentials ? "Credentials saved securely" : "Enter your API credentials"}
                    </CardDescription>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCredentialsOpen ? 'rotate-180' : ''}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <CredentialsForm 
                  onSave={handleCredentialsSave}
                  hasCredentials={!!credentials}
                  onClearStorage={handleClearStorage}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Stock Selection Section */}
        <Card className="bg-trading-card border-trading-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Stock
            </CardTitle>
            <CardDescription>
              Choose a stock to fetch real-time market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StockSearch 
              onSelectStock={setSelectedStock}
              selectedStock={selectedStock}
            />
          </CardContent>
        </Card>

        {/* TOTP Testing Section */}
        <Card className="bg-trading-card border-trading-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test TOTP & Fetch Live Prices
            </CardTitle>
            <CardDescription>
              Enter your 6-digit TOTP code to authenticate and fetch market data for {selectedStock?.name || 'selected stock'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TotpTestForm 
              onSubmit={handleTotpLogin}
              isLoading={connectionStatus === "pending"}
              disabled={!credentials || !selectedStock}
            />
          </CardContent>
        </Card>

        {/* Market Data Section */}
        {marketData && (
          <Card className="bg-trading-card border-trading-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Live Market Data
              </CardTitle>
              <CardDescription>
                Real-time stock price information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketData data={marketData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;