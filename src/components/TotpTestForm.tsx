import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, Smartphone } from "lucide-react";

interface TotpTestFormProps {
  onSubmit: (totpCode: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const TotpTestForm = ({ onSubmit, isLoading, disabled }: TotpTestFormProps) => {
  const [totpCode, setTotpCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.length === 6) {
      onSubmit(totpCode);
      setTotpCode("");
    }
  };

  const handleTotpChange = (value: string) => {
    // Only allow digits and max 6 characters
    const cleanValue = value.replace(/\D/g, "").slice(0, 6);
    setTotpCode(cleanValue);
  };

  return (
    <div className="space-y-4">
      {disabled && (
        <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-warning">⚠️ Please save your credentials first</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your API credentials are required before testing TOTP authentication
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <Label htmlFor="totpCode">TOTP Code</Label>
          </div>
          <Input
            id="totpCode"
            type="text"
            placeholder="000000"
            value={totpCode}
            onChange={(e) => handleTotpChange(e.target.value)}
            disabled={disabled || isLoading}
            className="bg-trading-card border-trading-border text-center text-lg font-mono tracking-widest"
            maxLength={6}
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={disabled || isLoading || totpCode.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Test Login & Fetch Prices
            </>
          )}
        </Button>
      </form>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>📱 This will attempt to:</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Authenticate with Angel One using your TOTP</li>
          <li>Retrieve session tokens (JWT, Refresh, Feed)</li>
          <li>Fetch live market data for popular stocks</li>
        </ul>
      </div>
    </div>
  );
};