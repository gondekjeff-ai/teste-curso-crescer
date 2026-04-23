import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    
    // Initialize Google Analytics if accepted
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    
    // Deny analytics
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
  };

  const savePreferences = (preferences: any) => {
    localStorage.setItem('cookie-consent', JSON.stringify({
      ...preferences,
      necessary: true, // Always true
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowPreferences(false);
    
    // Update consent
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
        'ad_storage': preferences.marketing ? 'granted' : 'denied'
      });
    }
  };

  if (!showBanner && !showPreferences) return null;

  if (showPreferences) {
    return <CookiePreferences onSave={savePreferences} onClose={() => setShowPreferences(false)} />;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">We use cookies</h3>
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShowPreferences(true)}>
              Manage Preferences
            </Button>
            <Button variant="outline" onClick={acceptNecessary}>
              Accept Necessary Only
            </Button>
            <Button onClick={acceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CookiePreferencesProps {
  onSave: (preferences: any) => void;
  onClose: () => void;
}

const CookiePreferences = ({ onSave, onClose }: CookiePreferencesProps) => {
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false
  });

  const handleSave = () => {
    onSave(preferences);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Cookie Preferences</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Necessary Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Essential for the website to function properly. Cannot be disabled.
                  </p>
                </div>
                <input type="checkbox" checked={true} disabled className="h-4 w-4" />
              </div>
            </div>
            
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="h-4 w-4" 
                />
              </div>
            </div>
            
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600">
                    Used to track visitors across websites for advertising purposes.
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="h-4 w-4" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default CookieConsentBanner;