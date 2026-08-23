import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type VolumeUnit =
  | 'cubic_meter'
  | 'm3'
  | 'square_meter'
  | 'm2'
  | 'kilogram'
  | 'kg'
  | 'hour'
  | 'h';

export type ResourceType =
  | 'material'
  | 'human resource'
  | 'container'
  | 'heavy machinery'
  | 'car'
  | 'money';

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  volumeValue: number | string;
  volumeUnit: VolumeUnit;
  storageId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  private http = inject(HttpClient);
  private apiUrl = '/api/resources';
  private resourcesSignal = signal<Resource[]>([]);

  resources = this.resourcesSignal.asReadonly();

  constructor() {
    this.loadResources();
  }

  getResources(): Resource[] {
    return this.resourcesSignal();
  }

  getResourceById(id: string): Resource | undefined {
    return this.getResources().find(r => r.id === id);
  }

  loadResources(): void {
    this.http.get<Resource[]>(this.apiUrl).subscribe({
      next: (resources) => {
        // Migrate old resources that have 'volume' instead of volumeValue/volumeUnit or old unit types
        const migratedResources = resources.map((r: any) => ({
          ...r,
          volumeValue: r.volume !== undefined ? r.volume : (r.volumeValue || 0),
          volumeUnit: this.getValidVolumeUnit(r.volumeUnit || 'cubic_meter'),
          type: this.getValidResourceType(r.type || 'material'),
        }));
        this.resourcesSignal.set(migratedResources);
      },
      error: (err) => {
        console.error('Error loading resources:', err);
      }
    });
  }

  addResource(resource: Omit<Resource, 'id'>): Promise<Resource> {
    // Ensure volumeUnit matches resource type
    let validUnit = resource.volumeUnit as VolumeUnit;
    if (!this.isValidUnitForResourceType(resource.type, validUnit)) {
      validUnit = this.getValidUnitForResourceType(resource.type);
    }

    const newResourceData = {
      ...resource,
      volumeUnit: validUnit,
    };
    
    return this.http.post<Resource>(this.apiUrl, newResourceData).toPromise() as Promise<Resource>;
  }

  updateResource(id: string, updates: Partial<Resource>): Promise<Resource | undefined> {
    const currentResources = this.getResources();
    const currentResource = currentResources.find(r => r.id === id);

    if (!currentResource) {
      return Promise.resolve(undefined);
    }

    // Determine the effective type for validation
    const effectiveType = (updates.type as ResourceType) || currentResource.type;

    const updatedVolumeUnit = updates.volumeUnit !== undefined 
      ? (this.isValidUnitForResourceType(effectiveType, updates.volumeUnit as VolumeUnit)
        ? updates.volumeUnit as VolumeUnit
        : this.getValidUnitForResourceType(effectiveType))
      : (updates.type ? this.getValidUnitForResourceType(effectiveType) : currentResource.volumeUnit);

    const updateData: any = {
      ...updates,
      volumeUnit: updatedVolumeUnit,
    };

    return this.http.put<Resource>(`${this.apiUrl}/${id}`, updateData).toPromise() as Promise<Resource>;
  }

  deleteResource(id: string): Promise<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).toPromise().then(() => true).catch(() => false);
  }

  private getValidVolumeUnit(unit: string): VolumeUnit {
    const validUnits: VolumeUnit[] = ['cubic_meter', 'm3', 'square_meter', 'm2', 'kilogram', 'kg', 'hour', 'h'];
    if (validUnits.includes(unit as VolumeUnit)) {
      return unit as VolumeUnit;
    }
    // Map old units to new ones
    const unitMap: Record<string, VolumeUnit> = {
      'volume': 'cubic_meter',
      'area': 'square_meter',
      'time': 'hour',
      'mass': 'kilogram',
    };
    return unitMap[unit] || 'cubic_meter';
  }

  private isValidUnitForResourceType(type: ResourceType, unit: VolumeUnit): boolean {
    const volumeUnits: VolumeUnit[] = ['cubic_meter', 'm3'];
    const areaUnits: VolumeUnit[] = ['square_meter', 'm2'];
    const massUnits: VolumeUnit[] = ['kilogram', 'kg'];
    const timeUnits: VolumeUnit[] = ['hour', 'h'];

    const volumeAreaMassUnits = [...volumeUnits, ...areaUnits, ...massUnits];

    switch (type) {
      case 'material':
      case 'container':
        return volumeAreaMassUnits.includes(unit);
      case 'human resource':
      case 'heavy machinery':
      case 'car':
        return timeUnits.includes(unit);
      default:
        return false;
    }
  }

  private getValidUnitForResourceType(type: ResourceType): VolumeUnit {
    switch (type) {
      case 'material':
      case 'container':
        return 'cubic_meter';
      case 'human resource':
      case 'heavy machinery':
      case 'car':
        return 'hour';
      default:
        return 'cubic_meter';
    }
  }

  private getValidResourceType(type: string): ResourceType {
    const validTypes: ResourceType[] = ['material', 'human resource', 'container', 'heavy machinery', 'car', 'money'];
    if (validTypes.includes(type as ResourceType)) {
      return type as ResourceType;
    }
    // Map old types to new ones
    const typeMap: Record<string, ResourceType> = {
      'server': 'container',
      'database': 'material',
    };
    return typeMap[type] || 'material';
  }
}
