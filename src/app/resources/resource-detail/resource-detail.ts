import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ResourceService, Resource, VolumeUnit, ResourceType } from '../resource';
import { formatVolumeUnit } from '../resource-utils';

@Component({
  selector: 'app-resource-detail',
  imports: [FormsModule],
  templateUrl: './resource-detail.html',
  styleUrl: './resource-detail.css',
})
export class ResourceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private resourceService = inject(ResourceService);

  resource: Resource | undefined;
  loading = true;

  // Edit state
  isEditing = false;
  editName = '';
  editVolumeValue = '';
  editVolumeUnit: VolumeUnit = 'cubic_meter';
  editStorageId = '';
  editType: ResourceType = 'material';

  ngOnInit(): void {
    const resourceId = this.route.snapshot.paramMap.get('id');
    if (resourceId) {
      this.resource = this.resourceService.getResourceById(resourceId);
    }
    this.loading = false;
  }

  goBack(): void {
    this.router.navigate(['/resources']);
  }

  startEdit(): void {
    if (!this.resource) return;
    this.isEditing = true;
    this.editName = this.resource.name;
    this.editVolumeValue = this.resource.volumeValue?.toString() || '';
    this.editVolumeUnit = this.resource.volumeUnit;
    this.editStorageId = this.resource.storageId;
    this.editType = this.resource.type;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveEdit(): void {
    if (!this.resource || !this.editName.trim()) return;

    this.resourceService.updateResource(this.resource.id, {
      name: this.editName,
      volumeValue: Number(this.editVolumeValue) || this.editVolumeValue,
      volumeUnit: this.editVolumeUnit,
      storageId: this.editStorageId,
      type: this.editType,
    }).then((updatedResource) => {
      // Update local resource reference
      if (updatedResource) {
        this.resource = this.resourceService.getResourceById(this.resource!.id);
      }
      this.isEditing = false;
    }).catch(err => {
      console.error('Error updating resource:', err);
    });
  }

  formatVolumeUnitDisplay(unit: VolumeUnit): string {
    return formatVolumeUnit(unit);
  }
}
