import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Pencil, Trash2, UserPlus, Mail, Check, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  avatar?: string;
}

interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'EMPLOYEE';
}

interface ApprovedEmail {
  id: string;
  email: string;
  used: boolean;
  createdAt: string;
  updatedAt: string;
}

const EmployeeManagement = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvedEmails, setApprovedEmails] = useState<ApprovedEmail[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [newApprovedEmail, setNewApprovedEmail] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
  });
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!isLoading && isAuthenticated && user?.role !== 'ADMIN') {
      navigate('/dashboard');
    } else if (!isLoading && isAuthenticated) {
      fetchEmployees();
      fetchApprovedEmails();
    }
  }, [isAuthenticated, isLoading, navigate, user]);
  
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive"
      });
    }
  };

  const fetchApprovedEmails = async () => {
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch('/api/auth/approved-emails', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch approved emails');
      }
      
      const data = await response.json();
      setApprovedEmails(data);
    } catch (error) {
      console.error('Error fetching approved emails:', error);
      toast({
        title: "Error",
        description: "Failed to load approved emails list",
        variant: "destructive"
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (value: 'ADMIN' | 'EMPLOYEE') => {
    setFormData(prev => ({ ...prev, role: value }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'EMPLOYEE',
    });
    setSelectedEmployee(null);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete employee');
      }
      
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      
      // Refresh employees
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  const handleAddApprovedEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate email
      if (!newApprovedEmail || !newApprovedEmail.includes('@')) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return;
      }
      
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch('/api/auth/approved-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ email: newApprovedEmail }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add approved email');
      }
      
      toast({
        title: "Success",
        description: "Email added to approved list",
      });
      
      // Reset and refresh
      setNewApprovedEmail('');
      setEmailDialogOpen(false);
      fetchApprovedEmails();
    } catch (error) {
      console.error('Error adding approved email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add approved email",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApprovedEmail = async (id: string) => {
    if (!confirm('Are you sure you want to remove this email from the approved list?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('viet_baguette_token');
      const response = await fetch(`/api/auth/approved-emails/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove approved email');
      }
      
      toast({
        title: "Success",
        description: "Email removed from approved list",
      });
      
      // Refresh the list
      fetchApprovedEmails();
    } catch (error) {
      console.error('Error removing approved email:', error);
      toast({
        title: "Error",
        description: "Failed to remove approved email",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.name || !formData.email || (!selectedEmployee && !formData.password)) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      const token = localStorage.getItem('viet_baguette_token');
      
      // If we're editing an existing employee, we'll use a different endpoint
      if (selectedEmployee) {
        const response = await fetch(`/api/auth/users/${selectedEmployee.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            ...(formData.password ? { password: formData.password } : {}),
            role: formData.role,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update employee');
        }
        
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        // Otherwise, we're creating a new employee
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create employee');
        }
        
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
      }
      
      // Reset form and refresh employee list
      resetForm();
      fetchEmployees();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error submitting employee:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save employee",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-viet-red"></div>
      </div>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <div className="flex space-x-2">
            {activeTab === 'employees' ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{selectedEmployee ? 'Edit' : 'Add'} Employee</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        {selectedEmployee ? 'New Password (leave blank to keep current)' : 'Password *'}
                      </Label>
                      <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        value={formData.password} 
                        onChange={handleInputChange} 
                        required={!selectedEmployee}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select 
                        value={formData.role} 
                        onValueChange={(value) => handleRoleChange(value as 'ADMIN' | 'EMPLOYEE')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrator</SelectItem>
                          <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          resetForm();
                          setDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-100 border-t-transparent"></div>
                            {selectedEmployee ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>{selectedEmployee ? 'Update' : 'Create'} Employee</>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Add Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Approved Email</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddApprovedEmail} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={newApprovedEmail} 
                        onChange={(e) => setNewApprovedEmail(e.target.value)} 
                        required
                        placeholder="employee@example.com"
                      />
                      <p className="text-sm text-gray-500">
                        This email will be able to self-register as an employee.
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setNewApprovedEmail('');
                          setEmailDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-100 border-t-transparent"></div>
                            Adding...
                          </>
                        ) : 'Add Email'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="emails">Approved Emails</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employees</CardTitle>
                <CardDescription>
                  Manage your restaurant's employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No employees found
                          </TableCell>
                        </TableRow>
                      ) : (
                        employees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={employee.avatar} alt={employee.name} />
                                  <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{employee.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>{employee.email}</TableCell>
                            <TableCell>
                              <Badge variant={employee.role === 'ADMIN' ? 'default' : 'outline'}>
                                {employee.role === 'ADMIN' ? 'Administrator' : 'Employee'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setFormData({
                                    name: employee.name,
                                    email: employee.email,
                                    password: '',
                                    role: employee.role,
                                  });
                                  setDialogOpen(true);
                                }}
                                className="mr-2"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(employee.id)}
                                className="text-red-500 hover:text-red-700"
                                disabled={employee.id === user?.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="emails">
            <Card>
              <CardHeader>
                <CardTitle>Approved Emails</CardTitle>
                <CardDescription>
                  Manage emails that can self-register for employee accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedEmails.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No approved emails found
                          </TableCell>
                        </TableRow>
                      ) : (
                        approvedEmails.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                <div>{item.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.used ? (
                                <Badge variant="secondary" className="flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Registered
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Available
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(item.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteApprovedEmail(item.id)}
                                className="text-red-500 hover:text-red-700"
                                disabled={item.used}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeManagement; 