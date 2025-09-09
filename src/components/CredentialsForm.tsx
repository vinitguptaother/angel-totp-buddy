import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Eye, EyeOff, Save } from "lucide-react";

interface CredentialsFormProps {
  onSave: (credentials: {
    apiKey: string;
    clientId: string;
    password: string;
    totpSecret?: string;
  }) => void;
  hasCredentials: boolean;
}

export const CredentialsForm = ({ onSave, hasCredentials }: CredentialsFormProps) => {
  const [formData, setFormData] = useState({
    apiKey: "",
    clientId: "",
    password: "",
    totpSecret: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showTotpSecret, setShowTotpSecret] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.apiKey && formData.clientId && formData.password) {
      onSave({
        apiKey: formData.apiKey,
        clientId: formData.clientId,
        password: formData.password,
        totpSecret: formData.totpSecret || undefined,
      });
      // Clear form for security
      setFormData({
        apiKey: "",
        clientId: "",
        password: "",
        totpSecret: "",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (hasCredentials) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-success">✓ Credentials have been saved securely</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your API credentials are stored and ready for authentication
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Update Credentials
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* API Key */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your Angel One SmartAPI Key</p>
                <p className="text-xs">
                  <a 
                    href="https://smartapi.angelone.in/docs/User" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Documentation
                  </a>
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="apiKey"
            type="text"
            placeholder="Enter your API Key"
            value={formData.apiKey}
            onChange={(e) => handleInputChange("apiKey", e.target.value)}
            required
            className="bg-trading-card border-trading-border"
          />
        </div>

        {/* Client ID */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your Angel One Client ID (User ID)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="clientId"
            type="text"
            placeholder="Enter your Client ID"
            value={formData.clientId}
            onChange={(e) => handleInputChange("clientId", e.target.value)}
            required
            className="bg-trading-card border-trading-border"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="password">Password</Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Your Angel One login password</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
              className="bg-trading-card border-trading-border pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* TOTP Secret (Optional) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="totpSecret">TOTP Secret (Optional)</Label>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Reference only - for your records</p>
                <p className="text-xs text-muted-foreground">
                  The actual TOTP codes will be entered separately
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              id="totpSecret"
              type={showTotpSecret ? "text" : "password"}
              placeholder="TOTP Secret (for reference)"
              value={formData.totpSecret}
              onChange={(e) => handleInputChange("totpSecret", e.target.value)}
              className="bg-trading-card border-trading-border pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setShowTotpSecret(!showTotpSecret)}
            >
              {showTotpSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Credentials Securely
        </Button>
      </form>
    </TooltipProvider>
  );
};