import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, Shield, TrendingUp, Wifi, WifiOff, Clock } from "lucide-react";
import { CredentialsForm } from "@/components/CredentialsForm";
import { TotpTestForm } from "@/components/TotpTestForm";
import { MarketData } from "@/components/MarketData";
import { useToast } from "@/hooks/use-toast";

type ConnectionStatus = "disconnected" | "connected" | "pending" | "error";

interface Credentials {
  apiKey: string;
  clientId: string;
  password: string;
  totpSecret?: string;
}

interface SessionTokens {
  jwtToken: string;
  refreshToken: string;
  feedToken: string;
}

const Index = () => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [sessionTokens, setSessionTokens] = useState<SessionTokens | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(true);
  const [marketData, setMarketData] = useState<any>(null);
  const { toast } = useToast();

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
      description: "Your Angel One API credentials have been securely stored.",
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
      // Mock API call - In real implementation, this would call Angel One's API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful login response
      const mockTokens: SessionTokens = {
        jwtToken: "mock_jwt_token_" + Date.now(),
        refreshToken: "mock_refresh_token_" + Date.now(),
        feedToken: "mock_feed_token_" + Date.now(),
      };
      
      setSessionTokens(mockTokens);
      setConnectionStatus("connected");
      
      // Fetch mock market data
      const mockData = {
        symbol: "RELIANCE",
        lastTradedPrice: 2847.65,
        change: 45.30,
        changePercent: 1.62,
        volume: 2547890,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMarketData(mockData);
      
      toast({
        title: "Login Successful",
        description: "Successfully connected to Angel One API and fetched market data.",
      });
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Login Failed",
        description: "Invalid TOTP code or connection error. Please try again.",
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
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* TOTP Testing Section */}
        <Card className="bg-trading-card border-trading-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test TOTP & Fetch Live Prices
            </CardTitle>
            <CardDescription>
              Enter your 6-digit TOTP code to authenticate and fetch market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TotpTestForm 
              onSubmit={handleTotpLogin}
              isLoading={connectionStatus === "pending"}
              disabled={!credentials}
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