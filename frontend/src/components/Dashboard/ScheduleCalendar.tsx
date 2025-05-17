
import { useState } from 'react';
import { useSchedule } from '@/contexts/ScheduleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DayProps {
  day: Date;
  shifts: any[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const Day = ({ day, shifts, isCurrentMonth, isToday }: DayProps) => {
  const { user } = useAuth();
  const dayNumber = day.getDate();
  const myShifts = shifts.filter(shift => shift.employeeId === user?.id);

  return (
    <div
      className={`min-h-24 p-2 border ${
        isToday ? 'bg-viet-beige/30 dark:bg-viet-beige/10' : ''
      } ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}`}
    >
      <div className="flex justify-between items-start">
        <span
          className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-sm ${
            isToday
              ? 'bg-viet-red text-white'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {dayNumber}
        </span>
      </div>
      
      {myShifts.length > 0 && (
        <div className="mt-2">
          {myShifts.map((shift, index) => (
            <div
              key={index}
              className="text-xs p-1 mb-1 rounded-sm bg-viet-red/10 border border-viet-red/20"
            >
              <div className="font-medium truncate">{shift.role}</div>
              <div className="flex items-center mt-0.5">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {shift.startTime} - {shift.endTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ScheduleCalendar = () => {
  const { shifts, getEmployeeShifts } = useSchedule();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const prevMonthDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  ).getDate();

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();

  // Get all shifts for the user
  const myShifts = user ? getEmployeeShifts(user.id) : [];
  
  // Group shifts by date for easier lookup
  const shiftsByDate: Record<string, any[]> = {};
  myShifts.forEach(shift => {
    if (!shiftsByDate[shift.date]) {
      shiftsByDate[shift.date] = [];
    }
    shiftsByDate[shift.date].push(shift);
  });

  // Prepare calendar days
  const calendarDays: { date: Date; inMonth: boolean }[] = [];
  
  // Add days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
      inMonth: false,
    });
  }
  
  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
      inMonth: true,
    });
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows of 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day),
      inMonth: false,
    });
  }

  // Format date to YYYY-MM-DD for shift lookup
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center justify-between">
          <span className="flex items-center">
            <CalendarIcon className="mr-2 h-5 w-5" />
            My Schedule
          </span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              &lt;
            </Button>
            <span>{monthName}</span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              &gt;
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7">
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center font-semibold text-sm">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => {
            const dateStr = formatDate(day.date);
            const shiftsForDay = shiftsByDate[dateStr] || [];
            const isToday = formatDate(today) === dateStr;
            
            return (
              <Day
                key={index}
                day={day.date}
                shifts={shiftsForDay}
                isCurrentMonth={day.inMonth}
                isToday={isToday}
              />
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Upcoming Shifts</h3>
          
          {myShifts
            .filter(shift => new Date(shift.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3)
            .map(shift => (
              <div 
                key={shift.id}
                className="mb-2 p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{new Date(shift.date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {shift.startTime} - {shift.endTime} • {shift.role}
                  </p>
                </div>
                <Badge className="bg-viet-beige text-viet-brown">
                  {shift.isConfirmed ? 'Confirmed' : 'Pending'}
                </Badge>
              </div>
            ))
          }
          
          {myShifts.filter(shift => new Date(shift.date) >= new Date()).length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No upcoming shifts</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Set Unavailable Time</h3>
          <Button variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Unavailability
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;
