import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ResourceService } from '../../core/services/resource.service';
import { Resource, ResourceCategory } from '../../core/models/resource.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
})
export class ResourcesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private resourceService = inject(ResourceService);

  resources: Resource[] = [];
  filteredResources: Resource[] = [];
  categories: ResourceCategory[] = [
    'article',
    'video',
    'course',
    'documentation',
    'tool',
    'other',
  ];

  // Filtering & Search
  searchQuery = '';
  selectedCategory: ResourceCategory | 'all' | 'favorites' = 'all';

  // Modal / Form state
  isModalOpen = false;
  resourceForm!: FormGroup;
  isConfirmDialogOpen = false;
  resourceToDeleteId = '';

  ngOnInit(): void {
    this.initForm();
    this.resourceService.getAll().subscribe((res) => {
      this.resources = res;
      this.applyFilter();
    });
  }

  initForm(): void {
    this.resourceForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      url: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
      description: ['', [Validators.maxLength(150)]],
      category: ['article' as ResourceCategory, Validators.required],
      tagsString: [''], // Will split into array on save
      isFavorite: [false],
    });
  }

  applyFilter(): void {
    let result = [...this.resources];

    // Search query
    if (this.searchQuery.trim()) {
      const lowerQuery = this.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(lowerQuery) ||
          r.description.toLowerCase().includes(lowerQuery) ||
          r.tags.some((t) => t.toLowerCase().includes(lowerQuery)),
      );
    }

    // Category filter
    if (this.selectedCategory === 'favorites') {
      result = result.filter((r) => r.isFavorite);
    } else if (this.selectedCategory !== 'all') {
      result = result.filter((r) => r.category === this.selectedCategory);
    }

    this.filteredResources = result;
  }

  openAddModal(): void {
    this.resourceForm.reset({
      category: 'article',
      isFavorite: false,
    });
    this.isModalOpen = true;
  }

  saveResource(): void {
    if (this.resourceForm.invalid) return;

    const val = this.resourceForm.value;
    const tags = val.tagsString
      ? val.tagsString
          .split(',')
          .map((t: string) => t.trim().toLowerCase())
          .filter(Boolean)
      : [];

    this.resourceService.create({
      title: val.title,
      url: val.url,
      description: val.description || '',
      category: val.category,
      tags,
      isFavorite: !!val.isFavorite,
    });

    this.isModalOpen = false;
  }

  toggleFavorite(id: string, event: Event): void {
    event.stopPropagation();
    this.resourceService.toggleFavorite(id);
  }

  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.resourceToDeleteId = id;
    this.isConfirmDialogOpen = true;
  }

  onConfirmDelete(): void {
    this.resourceService.delete(this.resourceToDeleteId);
    this.isConfirmDialogOpen = false;
  }

  getCategoryIcon(cat: ResourceCategory): string {
    switch (cat) {
      case 'article':
        return '📄';
      case 'video':
        return '🎥';
      case 'course':
        return '🎓';
      case 'documentation':
        return '🗂️';
      case 'tool':
        return '🛠️';
      default:
        return '🔗';
    }
  }
}
