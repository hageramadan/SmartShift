import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SwapRequestI } from '../../models/swap-request-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-swap-requests',
  imports: [CommonModule , FormsModule],
  templateUrl: './swap-requests.html',
  styleUrl: './swap-requests.css',
})
export class SwapRequests {
requests: SwapRequestI[] = [
    {
      id: 1,
      requester: 'Nurse Emily Rodriguez',
      requesterDepartment: 'Emergency Department',
      targetUser: 'Dr. Robert Brown',
      targetDepartment: 'Emergency Department',
      fromShift: 'Afternoon Shift',
      toShift: 'Morning Shift',
      date: '11/4/2025',
      reason: 'Family emergency - need to swap afternoon shift for morning shift',
      status: 'pending',
    },
    {
      id: 2,
      requester: 'Nurse Lisa Taylor',
      requesterDepartment: 'Intensive Care Unit',
      targetUser: 'Dr. James Wilson',
      targetDepartment: 'Intensive Care Unit',
      fromShift: 'ICU Day Shift',
      toShift: 'ICU Night Shift',
      date: '11/5/2025',
      reason: 'Medical appointment in the morning',
      status: 'approved',
    },
    {
      id: 3,
      requester: 'Dr. Robert Brown',
      requesterDepartment: 'Emergency Department',
      targetUser: 'Nurse Emily Rodriguez',
      targetDepartment: 'Emergency Department',
      fromShift: 'Morning Shift',
      toShift: 'Afternoon Shift',
      date: '11/6/2025',
      reason: 'Personal reasons',
      status: 'pending',
    },
  ];

  constructor(private toastr: ToastrService) {}

  get pendingCount() {
    return this.requests.filter(r => r.status === 'pending').length;
  }
  get approvedCount() {
    return this.requests.filter(r => r.status === 'approved').length;
  }
  get rejectedCount() {
    return this.requests.filter(r => r.status === 'rejected').length;
  }

  approveRequest(request: SwapRequestI) {
    request.status = 'approved';
    this.toastr.success('Request approved successfully');
  }

  rejectRequest(request: SwapRequestI) {
    request.status = 'rejected';
    this.toastr.error('Request rejected');
  }
}
