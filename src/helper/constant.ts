export enum IbadahStoreKeys {
  PRAYER_TIMES = "ibadah.pray.calendarByCity",
}

export enum IbadahConfigKeys {
  LOCATION_COUNTRY = "location.country",
  LOCATION_CITY = "location.city",
  LOCATION_POSTALCODE = "pray.postalCode",
  LOCATION_ADDRESS = "pray.address",
  PRAYER_NOTIFICATION_BEFORE = "pray.notification.before",
  PRAYER_NOTIFICATION_MESSAGE = "pray.notification.message",
  PRAYER_NAMES = "pray.names"
}

export enum IbadahCommandKeys {
  PRAYER_CONFIGURE = "ibadah.pray.configure",
  PRAYER_REFRESH = "ibadah.pray.refresh"
}

export enum IbadahPrayTime {
  Isha = "Isha",
  Fajr = "Fajr",
  Dhuhr = "Dhuhr",
  Asr = "Asr",
  Maghrib = "Maghrib",
  Midnight = "Midnight",
  Firstthird = "Firstthird",
  Lastthird = "Lastthird",
  Sunset = "sunset",
  Sunrise = "sunrise",
  Imsak = "Imsak"
}