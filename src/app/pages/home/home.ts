import { Component } from '@angular/core';
import { UserI } from '../../models/user-i';
import { DepartmentI } from '../../models/department-i';
import { SwapRequestI } from '../../models/swap-request-i';
import { ActivityI } from '../../models/activity-i';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
users: UserI[] = [
// { id: '1', nickname: 'Emily Rodriguez', role: 'Nurse' },
// { id: '2', nickname: 'Lisa Taylor', role: 'Nurse' },
// { id: '3', nickname: 'Robert Brown', role: 'Doctor' },
// { id: 4, nickname: 'Michael Chen', role: 'Doctor' },
// { id: 5, nickname: 'James Wilson', role: 'Doctor' },
// { id: 6, nickname: 'Sarah Johnson', role: 'Doctor' }
];


departments: DepartmentI[] = [
// { id: '1', name: 'Emergency Department', managerId: 'Dr. Michael Chen', members: 4 , staffCount: 4},
// { id: '2', name: 'Intensive Care Unit', managerId: 'Dr. James Wilson', members: 2 , staffCount: 8 },
// { id: '3', name: 'Surgery Department', managerId: 'Dr. Sarah Johnson', members: 0 , staffCount: 3 }
];


schedulesCount = 0;
activeShifts = 6;
completedShifts = 0;


// swapRequests: SwapRequestI[] = [
// { id: 1, name: 'Nurse Emily Rodriguez', date: '11/1/2025, 10:30:00 AM', status: 'pending' },
// { id: 2, name: 'Nurse Lisa Taylor', date: '10/30/2025, 2:20:00 PM', status: 'approved' },
// { id: 3, name: 'Dr. Robert Brown', date: '11/1/2025, 4:45:00 PM', status: 'pending' }
// ];


// recentActivity: ActivityI[] = [
// { id: 1, title: 'Nurse Emily Rodriguez requested a shift swap', date: '11/1/2025, 10:30:00 AM', status: 'pending' },
// { id: 2, title: 'Nurse Lisa Taylor requested a shift swap', date: '10/30/2025, 2:20:00 PM', status: 'approved' },
// { id: 3, title: 'Dr. Robert Brown requested a shift swap', date: '11/1/2025, 4:45:00 PM', status: 'pending' }
// ];


get totalUsers() {
return this.users.length;
}
get totalDepartments() {
return this.departments.length;
}
// get pendingSwapCount() {
// return this.swapRequests.filter(s => s.status === 'pending').length;
// }


// approveSwap(id: number) {
// const s = this.swapRequests.find(x => x.id === id);
// if (s) s.status = 'approved';
// const a = this.recentActivity.find(r => r.title.includes(s?.name || ''));
// if (a) a.status = 'approved';
// }


// rejectSwap(id: number) {
// const s = this.swapRequests.find(x => x.id === id);
// if (s) s.status = 'rejected';
// const a = this.recentActivity.find(r => r.title.includes(s?.name || ''));
// if (a) a.status = 'rejected';
// }
}
