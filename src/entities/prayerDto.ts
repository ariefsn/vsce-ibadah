export interface IPrayerByCalendarCityDto {
  year: number
  month: number
  city: string
  country: string
  postalCode: string
  address?: string
  method: number
}