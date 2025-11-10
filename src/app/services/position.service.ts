import { Injectable } from '@angular/core';
import { PositionI } from '../models/position-i';
import { ApiResponse } from '../models/api-response';
import { Api } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  constructor(private api: Api) { }

  getPositions(): Observable<ApiResponse<PositionI[]>> {
    return this.api.getAll<ApiResponse<PositionI[]>>('positions');
  }

  getPositionById(id: string): Observable<ApiResponse<PositionI>> {
    return this.api.getById<ApiResponse<PositionI>>('positions', id);
  }

  createPosition(pos: Partial<PositionI>): Observable<ApiResponse<PositionI>> {
    return this.api.post<ApiResponse<PositionI>>('positions', pos);
  }

  updatePosition(id: string, pos: Partial<PositionI>): Observable<ApiResponse<PositionI>> {
    return this.api.patch<ApiResponse<PositionI>>('positions', id, pos);
  }

  deletePosition(id: string): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>('positions', id);
  }
}
