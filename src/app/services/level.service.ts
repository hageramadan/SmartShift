import { Injectable } from '@angular/core';
import { LevelI } from '../models/level-i';
import { ApiResponse } from '../models/api-response';
import { Api } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LevelService {
  constructor(private api: Api) { }

  getLevels(): Observable<ApiResponse<LevelI[]>> {
    return this.api.getAll<ApiResponse<LevelI[]>>('levels');
  }

  getLevelById(id: string): Observable<ApiResponse<LevelI>> {
    return this.api.getById<ApiResponse<LevelI>>('levels', id);
  }

  createLevel(level: Partial<LevelI>): Observable<ApiResponse<LevelI>> {
    return this.api.post<ApiResponse<LevelI>>('levels', level);
  }

  updateLevel(id: string, level: Partial<LevelI>): Observable<ApiResponse<LevelI>> {
    return this.api.patch<ApiResponse<LevelI>>('levels', id, level);
  }

  deleteLevel(id: string): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>('levels', id);
  }
}
