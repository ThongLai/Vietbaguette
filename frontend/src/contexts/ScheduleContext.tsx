
import { createContext, useState, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { User } from './AuthContext';

export interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  role?: string; // e.g., "kitchen", "front", "manager"
  isConfirmed: boolean;
}

export interface ShiftTemplate {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  employeeId: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  role?: string;
}

interface ScheduleContextType {
  shifts: Shift[];
  shiftTemplates: ShiftTemplate[];
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, updates: Partial<Omit<Shift, 'id'>>) => void;
  deleteShift: (id: string) => void;
  addShiftTemplate: (template: Omit<ShiftTemplate, 'id'>) => void;
  updateShiftTemplate: (id: string, updates: Partial<Omit<ShiftTemplate, 'id'>>) => void;
  deleteShiftTemplate: (id: string) => void;
  generateShiftsFromTemplates: (startDate: Date, numWeeks: number) => void;
  getEmployeeShifts: (employeeId: string) => Shift[];
  checkAvailability: (employeeId: string, date: string, startTime: string, endTime: string) => boolean;
}

// Mock data
const mockShifts: Shift[] = [
  {
    id: '1',
    employeeId: '1', // Owner
    date: '2025-05-17',
    startTime: '09:00',
    endTime: '17:00',
    role: 'manager',
    isConfirmed: true,
  },
  {
    id: '2',
    employeeId: '2', // Chef Nguyen
    date: '2025-05-17',
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
    isConfirmed: true,
  },
  {
    id: '3',
    employeeId: '2', // Chef Nguyen
    date: '2025-05-18',
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
    isConfirmed: true,
  },
];

const mockTemplates: ShiftTemplate[] = [
  {
    id: '1',
    dayOfWeek: 1, // Monday
    employeeId: '1', // Owner
    startTime: '09:00',
    endTime: '17:00',
    role: 'manager',
  },
  {
    id: '2',
    dayOfWeek: 2, // Tuesday
    employeeId: '1', // Owner
    startTime: '09:00',
    endTime: '17:00',
    role: 'manager',
  },
  {
    id: '3',
    dayOfWeek: 3, // Wednesday
    employeeId: '1', // Owner
    startTime: '09:00',
    endTime: '17:00',
    role: 'manager',
  },
  {
    id: '4',
    dayOfWeek: 4, // Thursday
    employeeId: '1', // Owner
    startTime: '09:00',
    endTime: '17:00',
    role: 'manager',
  },
  {
    id: '5',
    dayOfWeek: 5, // Friday
    employeeId: '1', // Owner
    startTime: '09:00',
    endTime: '17:00',
    role: 'manager',
  },
  {
    id: '6',
    dayOfWeek: 6, // Saturday
    employeeId: '1', // Owner
    startTime: '09:00',
    endTime: '17:00',
    role: 'manager',
  },
  {
    id: '7',
    dayOfWeek: 1, // Monday
    employeeId: '2', // Chef Nguyen
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
  },
  {
    id: '8',
    dayOfWeek: 2, // Tuesday
    employeeId: '2', // Chef Nguyen
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
  },
  {
    id: '9',
    dayOfWeek: 3, // Wednesday
    employeeId: '2', // Chef Nguyen
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
  },
  {
    id: '10',
    dayOfWeek: 4, // Thursday
    employeeId: '2', // Chef Nguyen
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
  },
  {
    id: '11',
    dayOfWeek: 5, // Friday
    employeeId: '2', // Chef Nguyen
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
  },
  {
    id: '12',
    dayOfWeek: 6, // Saturday
    employeeId: '2', // Chef Nguyen
    startTime: '10:00',
    endTime: '18:00',
    role: 'kitchen',
  },
];

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: { children: ReactNode }) => {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [shiftTemplates, setShiftTemplates] = useState<ShiftTemplate[]>(mockTemplates);

  const addShift = (shift: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      id: Date.now().toString(),
      ...shift,
    };
    setShifts(prev => [...prev, newShift]);
    toast.success('Shift added');
  };

  const updateShift = (id: string, updates: Partial<Omit<Shift, 'id'>>) => {
    setShifts(prev =>
      prev.map(shift =>
        shift.id === id ? { ...shift, ...updates } : shift
      )
    );
    toast.success('Shift updated');
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(shift => shift.id !== id));
    toast.success('Shift deleted');
  };

  const addShiftTemplate = (template: Omit<ShiftTemplate, 'id'>) => {
    const newTemplate: ShiftTemplate = {
      id: Date.now().toString(),
      ...template,
    };
    setShiftTemplates(prev => [...prev, newTemplate]);
    toast.success('Shift template added');
  };

  const updateShiftTemplate = (id: string, updates: Partial<Omit<ShiftTemplate, 'id'>>) => {
    setShiftTemplates(prev =>
      prev.map(template =>
        template.id === id ? { ...template, ...updates } : template
      )
    );
    toast.success('Shift template updated');
  };

  const deleteShiftTemplate = (id: string) => {
    setShiftTemplates(prev => prev.filter(template => template.id !== id));
    toast.success('Shift template deleted');
  };

  const generateShiftsFromTemplates = (startDate: Date, numWeeks: number) => {
    const newShifts: Omit<Shift, 'id'>[] = [];
    const currentDate = new Date(startDate);
    
    // Generate shifts for the specified number of weeks
    for (let week = 0; week < numWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        // Find templates for this day of the week
        const dayOfWeek = currentDate.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
        const templates = shiftTemplates.filter(template => template.dayOfWeek === dayOfWeek);
        
        // Create shifts from templates
        for (const template of templates) {
          newShifts.push({
            employeeId: template.employeeId,
            date: currentDate.toISOString().split('T')[0],
            startTime: template.startTime,
            endTime: template.endTime,
            role: template.role,
            isConfirmed: false,
          });
        }
        
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // Add the generated shifts
    for (const shift of newShifts) {
      addShift(shift);
    }
    
    toast.success(`Generated ${newShifts.length} shifts from templates`);
  };

  const getEmployeeShifts = (employeeId: string): Shift[] => {
    return shifts.filter(shift => shift.employeeId === employeeId);
  };

  const checkAvailability = (employeeId: string, date: string, startTime: string, endTime: string): boolean => {
    // Convert times to minutes for easier comparison
    const convertToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const newShiftStart = convertToMinutes(startTime);
    const newShiftEnd = convertToMinutes(endTime);
    
    // Check for overlapping shifts
    const employeeShifts = getEmployeeShifts(employeeId).filter(shift => shift.date === date);
    
    for (const shift of employeeShifts) {
      const shiftStart = convertToMinutes(shift.startTime);
      const shiftEnd = convertToMinutes(shift.endTime);
      
      // Check if the new shift overlaps with an existing shift
      if (
        (newShiftStart >= shiftStart && newShiftStart < shiftEnd) || // New shift starts during existing shift
        (newShiftEnd > shiftStart && newShiftEnd <= shiftEnd) || // New shift ends during existing shift
        (newShiftStart <= shiftStart && newShiftEnd >= shiftEnd) // New shift encompasses existing shift
      ) {
        return false; // Not available
      }
    }
    
    return true; // Available
  };

  return (
    <ScheduleContext.Provider
      value={{
        shifts,
        shiftTemplates,
        addShift,
        updateShift,
        deleteShift,
        addShiftTemplate,
        updateShiftTemplate,
        deleteShiftTemplate,
        generateShiftsFromTemplates,
        getEmployeeShifts,
        checkAvailability,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
