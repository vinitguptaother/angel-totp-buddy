import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface CredentialStatusProps {
  hasCredentials: boolean;
  connectionStatus: "disconnected" | "connected" | "pending" | "error";
}

export const CredentialStatus = ({ hasCredentials, connectionStatus }: CredentialStatusProps) => {
  if (!hasCredentials) {
    return (
      <Alert className="border-warning/20 bg-warning/5">
        <Info className="h-4 w-4 text-warning" />
        <AlertDescription className="text-warning">
          <div className="space-y-3">
            <p><strong>Angel One API credentials required.</strong></p>
            <div className="text-sm space-y-1">
              <p><strong>To get your credentials:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Login to <Button variant="link" className="p-0 h-auto text-warning underline" asChild>
                  <a href="https://smartapi.angelone.in" target="_blank" rel="noopener noreferrer">
                    Angel One SmartAPI Portal <ExternalLink className="h-3 w-3 inline ml-1" />
                  </a>
                </Button></li>
                <li>Generate your API key and note your Client ID</li>
                <li>Set up TOTP in your Angel One mobile app</li>
                <li>Enter the credentials above to start testing</li>
              </ol>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (connectionStatus === "error") {
    return (
      <Alert className="border-destructive/20 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          <div className="space-y-2">
            <p><strong>Authentication failed.</strong> Common issues:</p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-2">
              <li>API key is invalid or expired</li>
              <li>Client ID doesn't match your Angel One account</li>
              <li>TOTP code expired (codes change every 30 seconds)</li>
              <li>MPIN is incorrect</li>
            </ul>
            <p className="text-sm">
              <Button variant="link" className="p-0 h-auto text-destructive underline" asChild>
                <a href="https://smartapi.angelone.in" target="_blank" rel="noopener noreferrer">
                  Verify your credentials in Angel One SmartAPI <ExternalLink className="h-3 w-3 inline ml-1" />
                </a>
              </Button>
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (connectionStatus === "connected") {
    return (
      <Alert className="border-success/20 bg-success/5">
        <CheckCircle className="h-4 w-4 text-success" />
        <AlertDescription className="text-success">
          <strong>✓ Successfully connected to Angel One API</strong>
          <p className="text-sm text-success/80 mt-1">Session tokens active and market data accessible.</p>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};