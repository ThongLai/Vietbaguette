import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { CommunicationProvider } from "@/contexts/CommunicationContext";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import MenuManagement from "./pages/MenuManagement";
import EmployeeManagement from "./pages/EmployeeManagement";
import Menu from "@/pages/Menu";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <OrderProvider>
            <CommunicationProvider>
              <ScheduleProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <NotificationProvider>
                    <BrowserRouter>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/dashboard/orders" element={<Orders />} />
                        <Route path="/dashboard/menu-management" element={<MenuManagement />} />
                        <Route path="/dashboard/employees" element={<EmployeeManagement />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/dashboard/notifications" element={<Notifications />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </NotificationProvider>
                </TooltipProvider>
              </ScheduleProvider>
            </CommunicationProvider>
          </OrderProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
