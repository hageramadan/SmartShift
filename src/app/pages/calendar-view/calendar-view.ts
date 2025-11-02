import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

interface Shift {
  id: number;
  name: string;
  department: string;
  shiftName: string;
  time: string;
  date: string;
}

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar-view.html',
  styleUrls: ['./calendar-view.css'],
})
export class CalendarView implements OnInit {
  departments = ['Emergency Department', 'Intensive Care Unit'];
  selectedDepartment: string = '';
  shifts: Shift[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    height: 'auto',
    eventDisplay: 'block',
    eventColor: '#107c8c',
    eventTextColor: '#fff',
  };

  ngOnInit() {
    this.loadShifts();
    this.updateCalendar();
  }

  loadShifts() {
    this.shifts = [
      {
        id: 1,
        name: 'Nurse Emily Rodriguez',
        department: 'Emergency Department',
        shiftName: 'Morning Shift',
        time: '07:00 - 15:00',
        date: '2025-11-03',
      },
      {
        id: 2,
        name: 'Nurse Emily Rodriguez',
        department: 'Emergency Department',
        shiftName: 'Afternoon Shift',
        time: '15:00 - 23:00',
        date: '2025-11-04',
      },
      {
        id: 3,
        name: 'Dr. Robert Brown',
        department: 'Emergency Department',
        shiftName: 'Morning Shift',
        time: '07:00 - 15:00',
        date: '2025-11-03',
      },
      {
        id: 4,
        name: 'Nurse Lisa Taylor',
        department: 'Intensive Care Unit',
        shiftName: 'ICU Day Shift',
        time: '08:00 - 20:00',
        date: '2025-11-03',
      },
      {
        id: 5,
        name: 'Nurse Lisa Taylor',
        department: 'Intensive Care Unit',
        shiftName: 'ICU Night Shift',
        time: '20:00 - 08:00',
        date: '2025-11-05',
      },
      {
        id: 6,
        name: 'Dr. Michael Chen',
        department: 'Emergency Department',
        shiftName: 'Morning Shift',
        time: '07:00 - 15:00',
        date: '2025-11-05',
      },
    ];
  }

  updateCalendar() {
    const filtered = this.getFilteredShifts();
    this.calendarOptions = {
      ...this.calendarOptions,
      events: filtered.map((s) => ({
        title: `${s.name} - ${s.shiftName}`,
        start: s.date,
        extendedProps: {
          department: s.department,
          time: s.time,
        },
      })),
    };
  }

  getFilteredShifts(): Shift[] {
    return this.selectedDepartment
      ? this.shifts.filter((s) => s.department === this.selectedDepartment)
      : this.shifts;
  }

  onDepartmentChange() {
    this.updateCalendar();
  }
}
