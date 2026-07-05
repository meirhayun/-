export type ServiceType = 'home' | 'building' | 'cleaning' | 'scaring';

export interface Review {
  readonly id: number;
  readonly name: string;
  readonly city: string;
  /** דירוג בין 1 ל-5 */
  readonly rating: 1 | 2 | 3 | 4 | 5;
  readonly text: string;
  readonly service: ServiceType;
  readonly date: string;
}

export interface ContactFormData {
  name: string;
  phone: string;
  city: string;
  service: ServiceType | '';
  message: string;
}

export const serviceLabels: Record<ServiceType, string> = {
  home: 'בית פרטי',
  building: 'בניין משותף',
  cleaning: 'ניקוי וחיטוי',
  scaring: 'מערכות scaring',
};
