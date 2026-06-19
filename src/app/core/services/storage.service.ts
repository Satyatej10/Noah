import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data) as T;
      } catch {
        return null;
      }
    }
    return null;
  }

  getObservable<T>(key: string): Observable<T | null> {
    return of(this.get<T>(key));
  }

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }

  exportAll(): string {
    if (typeof window === 'undefined') return '{}';
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data[key] = this.get(key);
      }
    }
    return JSON.stringify(data, null, 2);
  }

  importAll(jsonString: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const data = JSON.parse(jsonString) as Record<string, unknown>;
      Object.entries(data).forEach(([key, value]) => {
        this.set(key, value);
      });
      return true;
    } catch {
      return false;
    }
  }
}
