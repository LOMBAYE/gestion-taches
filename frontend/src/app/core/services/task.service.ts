import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private base = `${environment.apiUrl}/taches`;

  constructor(private http: HttpClient) {}

  findAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.base);
  }

  findOne(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/${id}`);
  }

  create(payload: { titre: string; description: string }): Observable<Task> {
    return this.http.post<Task>(this.base, payload);
  }

  update(id: string, payload: { titre?: string; description?: string }): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`);
  }

  submit(id: string): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${id}/soumettre`, {});
  }

  validate(id: string): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${id}/valider`, {});
  }

  reject(id: string): Observable<Task> {
    return this.http.patch<Task>(`${this.base}/${id}/rejeter`, {});
  }
}
