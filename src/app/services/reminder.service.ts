import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Reminder {
  id: string;
  pet_id: string;
  owner_id: string;
  title: string;
  notes?: string;
  due_date: string;
  due_time?: string;
  recurrence: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Gets ALL reminders for the logged-in user.
   */
  getAllMyReminders(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}/api/reminders/all`);
  }

  /**
   * Gets all reminders for a specific pet.
   */
  getRemindersForPet(petId: string): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(`${this.apiUrl}/api/reminders/pet/${petId}`);
  }

  /**
   * Creates a new reminder.
   */
  createReminder(reminderData: any): Observable<Reminder> {
    return this.http.post<Reminder>(`${this.apiUrl}/api/reminders/`, reminderData);
  }

  /**
   * Updates an existing reminder.
   */
  updateReminder(id: string, reminderData: any): Observable<Reminder> {
    return this.http.put<Reminder>(`${this.apiUrl}/api/reminders/${id}`, reminderData);
  }

  /**
   * Deletes a reminder.
   */
  deleteReminder(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/api/reminders/${id}`);
  }
}