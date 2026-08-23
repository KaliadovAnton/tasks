import { VolumeUnit } from './resource';

export function formatVolumeUnit(unit: VolumeUnit): string {
  const unitMap: Record<VolumeUnit, string> = {
    'cubic_meter': 'cubic meter (m3)',
    'm3': 'm3',
    'square_meter': 'square meter (m2)',
    'm2': 'm2',
    'kilogram': 'kilogram (kg)',
    'kg': 'kg',
    'hour': 'hour (h)',
    'h': 'h'
  };
  return unitMap[unit] || unit;
}
