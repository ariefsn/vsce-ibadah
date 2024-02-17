export interface IPrayer {
  timings: ITimings
  date: IDate
  meta: IMeta
}

export interface ITimings {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Sunset: string
  Maghrib: string
  Isha: string
  Imsak: string
  Midnight: string
  Firstthird: string
  Lastthird: string
}

export interface IDate {
  readable: string
  timestamp: string
  gregorian: IGregorian
  hijri: IHijri
}

export interface IGregorian {
  date: string
  format: string
  day: string
  weekday: IWeekday
  month: IMonth
  year: string
  designation: IDesignation
}

export interface IWeekday {
  en: string
  ar: string
}

export interface IDesignation {
  abbreviated: string
  expanded: string
}

export interface IHijri {
  date: string
  format: string
  day: string
  weekday: IWeekday
  month: IMonth
  year: string
  designation: IDesignation
  holidays: string[]
}

export interface IMonth {
  number: number
  en: string
  ar: string
}

export interface IMeta {
  latitude: number
  longitude: number
  timezone: string
  method: IMethod
  latitudeAdjustmentMethod: string
  midnightMode: string
  school: string
  offset: IOffset
}

export interface IMethod {
  id: number
  name: string
  params: IParams
  location: ILocation
}

export interface IParams {
  Fajr: number
  Isha: number
}

export interface ILocation {
  latitude: number
  longitude: number
}

export interface IOffset {
  Imsak: number
  Fajr: number
  Sunrise: number
  Dhuhr: number
  Asr: number
  Maghrib: number
  Sunset: number
  Isha: number
  Midnight: number
}
