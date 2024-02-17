import { IbadahPrayTime } from "./constant";

export const nextPrayTime = (lastPray: IbadahPrayTime): IbadahPrayTime => {
  switch (lastPray) {
    case IbadahPrayTime.Isha:
      return IbadahPrayTime.Fajr
    case IbadahPrayTime.Fajr:
      return IbadahPrayTime.Dhuhr
    case IbadahPrayTime.Dhuhr:
      return IbadahPrayTime.Asr
    case IbadahPrayTime.Asr:
      return IbadahPrayTime.Maghrib
    case IbadahPrayTime.Maghrib:
      return IbadahPrayTime.Isha
    default:
      return IbadahPrayTime.Isha
  }
}