import { Injectable, computed, resource, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Category } from './categories.models';
import { CategoryService } from './categories.service';

@Injectable({ providedIn: 'root' })
export class CategoryStore {
  private categoryService = inject(CategoryService);

  private categoriesResource = resource({
    loader: () => firstValueFrom(this.categoryService.getAll())
  });

  categories = computed(() => this.categoriesResource.value() ?? []);

  getCategoryName(categoryId: string): string {
    return this.categories().find(c => c.id === categoryId)?.name ?? 'Sem categoria';
  }
}