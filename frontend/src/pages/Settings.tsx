
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-viet-red"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('admin.settings')}</h1>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.theme')}</CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <RadioGroup
                    value={theme}
                    onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light">{t('settings.theme.light')}</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark">{t('settings.theme.dark')}</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system">{t('settings.theme.system')}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">{t('settings.language')}</h3>
                  <RadioGroup
                    value={language}
                    onValueChange={(value) => setLanguage(value as 'en' | 'vi')}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="en" id="lang-en" />
                      <Label htmlFor="lang-en">
                        <span className="mr-2">🇬🇧</span>
                        {t('settings.language.english')}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="vi" id="lang-vi" />
                      <Label htmlFor="lang-vi">
                        <span className="mr-2">🇻🇳</span>
                        {t('settings.language.vietnamese')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details and password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-viet-red text-white flex items-center justify-center text-2xl font-bold mr-4">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{user.name}</h3>
                      <p className="text-muted-foreground">{user.email}</p>
                      <p className="text-sm mt-1 capitalize">{user.role} Account</p>
                    </div>
                  </div>
                  
                  <p className="text-center text-muted-foreground">
                    Account settings management will be implemented in the next phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Customize how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Notification preferences will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
