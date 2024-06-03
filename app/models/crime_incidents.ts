export type CrimeIncidents = {
  DR_NO: string;
  DATE_REPORTED: Date;
  DATE_OCCURRED: Date;
  VICTIM_ID: number | null;
  CRIME_STATUS_CODE: string;
  WEAPON_TYPE_CODE: number | null;
  PREMISE_CODE: number | null;
  LOCATION_ID: number | null;
  LATITUDE: number | null;
  LONGITUDE: number | null;
}