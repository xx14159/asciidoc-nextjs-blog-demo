import range from "lodash/range";

export const calculateSunCoords = (
  lat: number,
  long: number,
  year: number,
  time: string,
  wasm: typeof import("@/wasm/analemma-helpers/pkg/analemma_helpers"),
) => {
  const days =
    (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365;
  const yearStartTimestamp = new Date(year.toString()).getTime();

  return range(days)
    .map((i) => {
      const [h, m] = time.split(":").map((v) => Number(v));
      const minute = h * 60 + m;
      const ujd_utc = yearStartTimestamp / 86400 / 1000 + i + minute / 1440;
      const ujd_tt =
        unixToTT(yearStartTimestamp + i * 86400 * 1000 + minute * 60 * 1000) /
        86400 /
        1000;

      const coords = wasm.sun_ra_dec(ujd_tt) as number[] | undefined;
      if (coords === undefined) {
        return null;
      }

      const [az, alt, hourAngle, localSiderealTime] = raDecToAzAlt(
        (coords[0] / 180) * Math.PI,
        (coords[1] / 180) * Math.PI,
        (lat / 180) * Math.PI,
        (long / 180) * Math.PI,
        ujd_utc,
        ujd_tt,
      );

      const date = new Date(yearStartTimestamp + i * 86400 * 1000);
      return [
        (az / Math.PI) * 180,
        (alt / Math.PI) * 180,
        (hourAngle / Math.PI) * 12,
        (localSiderealTime / Math.PI) * 12,
        date.getUTCMonth() + 1,
        date.getUTCDate(),
      ];
    })
    .filter((val) => val !== null) as number[][];
};

export const raDecToAzAlt = (
  ra: number,
  dec: number,
  lat: number,
  lon: number,
  ujd_utc: number,
  ujd_tt: number,
) => {
  const gmst = greenwichMeanSiderealTime(ujd_utc, ujd_tt);
  let localSiderealTime = (gmst + lon) % (2 * Math.PI);
  if (localSiderealTime < 0) localSiderealTime += 2 * Math.PI;
  if (localSiderealTime > Math.PI) localSiderealTime -= 2 * Math.PI;

  let hourAngle = localSiderealTime - ra;
  if (hourAngle < 0) hourAngle += 2 * Math.PI;
  if (hourAngle > Math.PI) hourAngle -= 2 * Math.PI;

  let az = Math.atan2(
    -Math.sin(hourAngle),
    Math.tan(dec) * Math.cos(lat) - Math.cos(hourAngle) * Math.sin(lat),
  );
  if (az < 0) az += 2 * Math.PI;
  let alt = Math.asin(
    Math.sin(dec) * Math.sin(lat) +
      Math.cos(dec) * Math.cos(lat) * Math.cos(hourAngle),
  );

  return [az, alt, hourAngle, localSiderealTime];
};

const greenwichMeanSiderealTime = (ujd_utc: number, ujd_tt: number) => {
  const t = (ujd_tt - (2451545.0 - 2440587.5)) / 36525.0;
  let gmst =
    earthRotationAngle(ujd_utc) +
    ((0.014506 +
      4612.156534 * t +
      1.3915817 * t * t -
      0.00000044 * t * t * t -
      0.000029956 * t * t * t * t -
      0.0000000368 * t * t * t * t * t) /
      3600 /
      180.0) *
      Math.PI;
  gmst %= 2 * Math.PI;
  if (gmst < 0) gmst += 2 * Math.PI;
  if (gmst > Math.PI) gmst -= 2 * Math.PI;
  return gmst;
};

const earthRotationAngle = (ujd: number) => {
  const t = ujd - (2451545.0 - 2440587.5);
  const f = t % 1.0;
  let theta = 2 * Math.PI * (f + 0.779057273264 + 0.00273781191135448 * t);
  theta %= 2 * Math.PI;
  if (theta < 0) theta += 2 * Math.PI;
  return theta;
};

export const unixToTT = (timestamp: number) => {
  let offset = 32.184;
  if (timestamp >= 1483228800000) offset += 37; // 2017-01-01
  else if (timestamp >= 1435708800000) offset += 36; // 2015-07-01
  else if (timestamp >= 1341100800000) offset += 35; // 2012-07-01
  else if (timestamp >= 1230768000000) offset += 34; // 2009-01-01
  else if (timestamp >= 1136073600000) offset += 33; // 2006-01-01
  else if (timestamp >= 915148800000) offset += 32; // 1999-01-01
  else if (timestamp >= 867715200000) offset += 31; // 1997-07-01
  else if (timestamp >= 820454400000) offset += 30; // 1996-01-01
  else if (timestamp >= 773020800000) offset += 29; // 1994-07-01
  else if (timestamp >= 741484800000) offset += 28; // 1993-07-01
  else if (timestamp >= 709948800000) offset += 27; // 1992-07-01
  else if (timestamp >= 662688000000) offset += 26; // 1991-01-01
  else if (timestamp >= 631152000000) offset += 25; // 1990-01-01
  else if (timestamp >= 567993600000) offset += 24; // 1988-01-01
  else if (timestamp >= 489024000000) offset += 23; // 1985-07-01
  else if (timestamp >= 425865600000) offset += 22; // 1983-07-01
  else if (timestamp >= 394329600000) offset += 21; // 1982-07-01
  else if (timestamp >= 362793600000) offset += 20; // 1981-07-01
  else if (timestamp >= 315532800000) offset += 19; // 1980-01-01
  else if (timestamp >= 283996800000) offset += 18; // 1979-01-01
  else if (timestamp >= 252460800000) offset += 17; // 1978-01-01
  else if (timestamp >= 220924800000) offset += 16; // 1977-01-01
  else if (timestamp >= 189302400000) offset += 15; // 1976-01-01
  else if (timestamp >= 157766400000) offset += 14; // 1975-01-01
  else if (timestamp >= 126230400000) offset += 13; // 1974-01-01
  else if (timestamp >= 94694400000) offset += 12; // 1973-01-01
  else if (timestamp >= 78796800000) offset += 11; // 1972-07-01
  else if (timestamp >= 63072000000) offset += 10; // 1972-01-01
  // TODO: TAI-UTC before 1972-01-01

  return timestamp + offset * 1000;
};

const arrange = (a: number, ya: number, b: number, yb: number) => {
  if (Math.abs(ya) < Math.abs(yb)) return [b, yb, a, ya];
  else return [a, ya, b, yb];
};

export const findRootBrent = (
  tLeft: number,
  tRight: number,
  f: (t: number) => number,
) => {
  let [a, ya, b, yb] = arrange(tLeft, f(tLeft), tRight, f(tRight));
  if (!(ya * yb <= 0.0)) return null;
  let [c, yc, d] = [a, ya, a];
  let flag = true;

  for (;;) {
    if (yb === 0.0) {
      return b;
    }
    let s: number;
    if (ya !== yc && yb !== yc) {
      s =
        (a * yb * yc) / ((ya - yb) * (ya - yc)) +
        (b * ya * yc) / ((yb - ya) * (yb - yc)) +
        (c * ya * yb) / ((yc - ya) * (yc - yb));
    } else {
      s = b - (yb * (b - a)) / (yb - ya);
    }

    let cond1 = (s - b) * (s - (3.0 * a + b) / 4.0) > 0.0;
    let cond2 = flag && Math.abs(s - b) >= Math.abs(b - c) / 2.0;
    let cond3 = !flag && Math.abs(s - b) >= Math.abs(c - d) / 2.0;
    let cond4 = flag && b == c;
    let cond5 = !flag && c == d;

    if (cond1 || cond2 || cond3 || cond4 || cond5) {
      s = (a + b) / 2.0;
      flag = true;
    } else {
      flag = false;
    }

    if ((s == a || s == b) && b == c && c == d) {
      return b;
    }

    let ys = f(s);
    if (Number.isNaN(ys)) {
      return null;
    }
    d = c;
    c = b;
    yc = yb;
    if (ya * ys < 0.0) {
      // Root bracketed between a and s
      [a, ya, b, yb] = arrange(a, ya, s, ys);
    } else {
      // Root bracketed between s and b
      [a, ya, b, yb] = arrange(s, ys, b, yb);
    }
  }
};
