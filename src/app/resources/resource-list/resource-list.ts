import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../auth/auth';
import { ResourceService, Resource, VolumeUnit, ResourceType } from '../resource';
import { formatVolumeUnit } from '../resource-utils';

@Component({
  selector: 'app-resource-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.css',
})
export class ResourceList implements OnInit {
  private resourceService = inject(ResourceService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get resources(): Resource[] {
    return this.resourceService.resources();
  }

  newResourceType: ResourceType = 'material';
  newResourceName = '';
  newResourceVolumeValue = '';
  newResourceVolumeUnit: VolumeUnit = 'cubic_meter';
  newResourceStorageId = '';

  // Edit state
  editingResourceId: string | null = null;
  editResourceName = '';
  editResourceVolumeValue = '';
  editResourceVolumeUnit: VolumeUnit = 'cubic_meter';
  editResourceStorageId = '';
  editResourceType: ResourceType = 'material';

  // State for expanded resource details panel
  expandedResourceId: string | null = null;

  toggleResourceDetails(resourceId: string): void {
    if (this.expandedResourceId === resourceId) {
      this.expandedResourceId = null;
    } else {
      this.expandedResourceId = resourceId;
    }
  }

  get expandedResource(): Resource | undefined {
    if (!this.expandedResourceId) return undefined;
    return this.resources.find(r => r.id === this.expandedResourceId);
  }

  get currentUser(): User | null {
    return this.authService.user();
  }

  ngOnInit(): void {
    this.loadResources();
  }

  loadResources(): void {
    this.resourceService.loadResources();
  }

  addResource(): void {
    if (this.newResourceName.trim() && this.newResourceType) {
      this.resourceService.addResource({
        type: this.newResourceType,
        name: this.newResourceName,
        volumeValue: Number(this.newResourceVolumeValue) || this.newResourceVolumeValue,
        volumeUnit: this.newResourceVolumeUnit,
        storageId: this.newResourceStorageId,
      }).then(() => {
        this.newResourceType = 'material';
        this.newResourceName = '';
        this.newResourceVolumeValue = '';
        this.newResourceVolumeUnit = 'cubic_meter';
        this.newResourceStorageId = '';
        this.resourceService.loadResources();
      }).catch(err => {
        console.error('Error adding resource:', err);
      });
    }
  }

  deleteResource(resourceId: string): void {
    if (confirm('Are you sure you want to delete this resource?')) {
      this.resourceService.deleteResource(resourceId).then(() => {
        this.resourceService.loadResources();
      }).catch(err => {
        console.error('Error deleting resource:', err);
      });
    }
  }

  startEdit(resource: Resource): void {
    this.editingResourceId = resource.id;
    this.editResourceName = resource.name;
    this.editResourceVolumeValue = resource.volumeValue?.toString() || '';
    this.editResourceVolumeUnit = resource.volumeUnit;
    this.editResourceStorageId = resource.storageId;
    this.editResourceType = resource.type;
  }

  cancelEdit(): void {
    this.editingResourceId = null;
    this.editResourceName = '';
    this.editResourceVolumeValue = '';
    this.editResourceVolumeUnit = 'cubic_meter';
    this.editResourceStorageId = '';
    this.editResourceType = 'material';
  }

  saveEdit(resourceId: string): void {
    if (this.editResourceName.trim()) {
      this.resourceService.updateResource(resourceId, {
        name: this.editResourceName,
        volumeValue: Number(this.editResourceVolumeValue) || this.editResourceVolumeValue,
        volumeUnit: this.editResourceVolumeUnit,
        storageId: this.editResourceStorageId,
        type: this.editResourceType,
      }).then(() => {
        this.cancelEdit();
        this.resourceService.loadResources();
      }).catch(err => {
        console.error('Error updating resource:', err);
      });
    }
  }

  handleRowClick(event: Event, resource: Resource): void {
    if (this.editingResourceId === resource.id) {
      return;
    }
    
    const target = event.target as HTMLElement;
    // Prevent navigation if clicking on the action select or its elements
    if (target.closest('.action-select') || target.tagName === 'SELECT' || target.tagName === 'OPTION') {
      return;
    }

    this.navigateToResourceDetail(resource.id);
  }

  navigateToResourceDetail(resourceId: string): void {
    this.router.navigate([`/resources/${resourceId}`]);
  }

  handleActionSelect(event: Event, resource: Resource): void {
    const selectElement = event.target as HTMLSelectElement;
    const action = selectElement.value;
    
    if (action === 'edit') {
      this.startEdit(resource);
    } else if (action === 'delete') {
      this.deleteResource(resource.id);
    }
    
    // Reset the select to default
    selectElement.value = '';
  }

  formatVolumeUnitDisplay(unit: VolumeUnit): string {
    return formatVolumeUnit(unit);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
