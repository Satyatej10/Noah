import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Resource, ResourceCategory } from '../models/resource.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private readonly RESOURCES_KEY = 'noah_resources';

  private resourcesSubject = new BehaviorSubject<Resource[]>([]);
  resources$ = this.resourcesSubject.asObservable();

  constructor(private storage: StorageService) {
    let resources = this.loadResources();
    if (resources.length === 0) {
      const seedResources: Resource[] = [
        {
          id: 'res-1',
          title: 'Angular Standalone Component Guide',
          url: 'https://angular.dev/guide/components/standalone',
          description:
            'Official Angular guide explaining standalone components, directives, and pipes.',
          tags: ['angular', 'standalone', 'components'],
          category: 'documentation',
          isFavorite: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'res-2',
          title: 'RxJS Decision Tree Tool',
          url: 'https://rxjs.dev/operator-decision-tree',
          description:
            'An interactive wizard to help you pick the right RxJS operator for your use case.',
          tags: ['rxjs', 'operators', 'reactive'],
          category: 'tool',
          isFavorite: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'res-3',
          title: 'TypeScript Deep Dive Online Book',
          url: 'https://basarat.gitbook.io/typescript',
          description:
            'The definitive guide to learning and mastering advanced TypeScript patterns.',
          tags: ['typescript', 'book', 'advanced'],
          category: 'course',
          isFavorite: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'res-4',
          title: 'Learn RxJS in 60 Minutes',
          url: 'https://www.youtube.com/watch?v=PhggNGsRQ3k',
          description:
            'High-quality video tutorial covering Observables, Observers, and basic operators.',
          tags: ['rxjs', 'video', 'tutorial'],
          category: 'video',
          isFavorite: false,
          createdAt: new Date().toISOString(),
        },
      ];
      resources = seedResources;
      this.storage.set(this.RESOURCES_KEY, resources);
    }
    this.resourcesSubject.next(resources);
  }

  getAll(): Observable<Resource[]> {
    return this.resources$;
  }

  getByCategory(category: ResourceCategory): Observable<Resource[]> {
    return this.resources$.pipe(
      map((resources) => resources.filter((r) => r.category === category)),
    );
  }

  getFavorites(): Observable<Resource[]> {
    return this.resources$.pipe(
      map((resources) => resources.filter((r) => r.isFavorite)),
    );
  }

  search(query: string): Observable<Resource[]> {
    const lowerQuery = query.toLowerCase();
    return this.resources$.pipe(
      map((resources) =>
        resources.filter(
          (r) =>
            r.title.toLowerCase().includes(lowerQuery) ||
            r.description.toLowerCase().includes(lowerQuery) ||
            r.tags.some((t) => t.toLowerCase().includes(lowerQuery)),
        ),
      ),
    );
  }

  create(resource: Omit<Resource, 'id' | 'createdAt'>): Resource {
    const newResource: Resource = {
      ...resource,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const resources = [...this.resourcesSubject.getValue(), newResource];
    this.saveResources(resources);
    return newResource;
  }

  update(id: string, updates: Partial<Resource>): void {
    const resources = this.resourcesSubject
      .getValue()
      .map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.saveResources(resources);
  }

  delete(id: string): void {
    const resources = this.resourcesSubject
      .getValue()
      .filter((r) => r.id !== id);
    this.saveResources(resources);
  }

  toggleFavorite(id: string): void {
    const resource = this.resourcesSubject.getValue().find((r) => r.id === id);
    if (resource) {
      this.update(id, { isFavorite: !resource.isFavorite });
    }
  }

  getAllTags(): string[] {
    const tags = new Set<string>();
    this.resourcesSubject
      .getValue()
      .forEach((r) => r.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }

  private loadResources(): Resource[] {
    return this.storage.get<Resource[]>(this.RESOURCES_KEY) || [];
  }

  private saveResources(resources: Resource[]): void {
    this.storage.set(this.RESOURCES_KEY, resources);
    this.resourcesSubject.next(resources);
  }
}
