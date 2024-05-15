mod utils;

use serde::Serialize;
use wasm_bindgen::prelude::*;

use utils::{chebyshev_6, find_root_brent};

const UNIX_EPOCH: f64 = 2440587.5;
const START_EPOCH: f64 = 2447888.5 - UNIX_EPOCH;
const FINAL_EPOCH: f64 = 2473488.5 - UNIX_EPOCH;
const N_REC: usize = 800;
const SUN_START_LOC: usize = 0;
const SUN_N_SUB: usize = 2;
const EM_START_LOC: usize = 42;
const EM_N_SUB: usize = 2;
const MOON_START_LOC: usize = 84;
const MOON_N_SUB: usize = 8;
const N_COEFF: usize = 7;
const REC_SIZE: usize = (SUN_N_SUB + EM_N_SUB + MOON_N_SUB) * N_COEFF * 3;

#[used]
static EPH: [f64; N_REC * REC_SIZE] = include!(concat!(env!("OUT_DIR"), "/eph.rs"));

const EARTH_MOON_MASS_RATIO: f64 = 81.30056822149722;
const C: f64 = 299_792.468;

#[wasm_bindgen]
pub fn sun_ra_dec(ujd: f64) -> JsValue {
    if !(START_EPOCH..=FINAL_EPOCH).contains(&ujd) {
        return JsValue::UNDEFINED;
    }
    sun_ra_dec_impl(ujd)
        .serialize(&serde_wasm_bindgen::Serializer::json_compatible())
        .unwrap_or(JsValue::UNDEFINED)
}

fn sun_ra_dec_impl(ujd: f64) -> (f64, f64) {
    let (rx, ry, rz) = sun_geo_xyz(ujd);
    let r = (rx.powi(2) + ry.powi(2) + rz.powi(2)).sqrt();
    let (vx, vy, vz) = earth_v_xyz(ujd);

    let x = rx / r * C + vx;
    let y = ry / r * C + vy;
    let z = rz / r * C + vz;

    let ra = (y.signum() * (x / x.hypot(y)).acos()).rem_euclid(std::f64::consts::TAU)
        / std::f64::consts::FRAC_PI_2
        * 90.0;
    let dec = (z / x.hypot(y)).atan() / std::f64::consts::FRAC_PI_2 * 90.0;

    (ra, dec)
}

fn sun_geo_xyz(ujd: f64) -> (f64, f64, f64) {
    let ltt = find_root_brent(0.005, 0.0065, |ltt| {
        let (sun_x, sun_y, sun_z) = sun_xyz(ujd - ltt);
        let (earth_x, earth_y, earth_z) = earth_xyz(ujd);
        ((sun_x - earth_x).powi(2) + (sun_y - earth_y).powi(2) + (sun_z - earth_z).powi(2)).sqrt()
            - C * ltt * 86400.0
    })
    .unwrap();

    let (sun_x, sun_y, sun_z) = sun_xyz(ujd - ltt);
    let (earth_x, earth_y, earth_z) = earth_xyz(ujd);

    (sun_x - earth_x, sun_y - earth_y, sun_z - earth_z)
}

fn sun_xyz(ujd: f64) -> (f64, f64, f64) {
    let rec_idx = (ujd - START_EPOCH).div_euclid(32.0) as usize;
    let jd_rem = (ujd - START_EPOCH).rem_euclid(32.0);
    let rec = &EPH[rec_idx * REC_SIZE..(rec_idx + 1) * REC_SIZE];

    let sub_len = 32.0 / SUN_N_SUB as f64;
    let sub_i = jd_rem.div_euclid(sub_len) as usize;
    let t = jd_rem.rem_euclid(sub_len) / sub_len * 2.0 - 1.0;
    let [x, y, z] = std::array::from_fn(|j| {
        chebyshev_6(
            t,
            &rec[SUN_START_LOC + sub_i * N_COEFF * 3 + N_COEFF * j
                ..SUN_START_LOC + sub_i * N_COEFF * 3 + N_COEFF * (j + 1)]
                .try_into()
                .unwrap(),
        )
    });

    (x, y, z)
}

fn earth_xyz(ujd: f64) -> (f64, f64, f64) {
    let rec_idx = (ujd - START_EPOCH).div_euclid(32.0) as usize;
    let jd_rem = (ujd - START_EPOCH).rem_euclid(32.0);
    let rec = &EPH[rec_idx * REC_SIZE..(rec_idx + 1) * REC_SIZE];

    let [[em_x, em_y, em_z], [moon_x, moon_y, moon_z]] =
        [(EM_START_LOC, EM_N_SUB), (MOON_START_LOC, MOON_N_SUB)].map(|(start_loc, n_sub)| {
            let sub_len = 32.0 / n_sub as f64;
            let sub_i = jd_rem.div_euclid(sub_len) as usize;
            let t = jd_rem.rem_euclid(sub_len) / sub_len * 2.0 - 1.0;
            std::array::from_fn(|j| {
                chebyshev_6(
                    t,
                    &rec[start_loc + sub_i * N_COEFF * 3 + N_COEFF * j
                        ..start_loc + sub_i * N_COEFF * 3 + N_COEFF * (j + 1)]
                        .try_into()
                        .unwrap(),
                )
            })
        });
    let x = em_x - moon_x / (EARTH_MOON_MASS_RATIO + 1.0);
    let y = em_y - moon_y / (EARTH_MOON_MASS_RATIO + 1.0);
    let z = em_z - moon_z / (EARTH_MOON_MASS_RATIO + 1.0);

    (x, y, z)
}

fn earth_v_xyz(ujd: f64) -> (f64, f64, f64) {
    const DELTA: f64 = 5e-5;

    let (x0, y0, z0) = earth_xyz(ujd - DELTA);
    let (x1, y1, z1) = earth_xyz(ujd + DELTA);

    (
        (x1 - x0) / (DELTA * 2.0) / 86400.0,
        (y1 - y0) / (DELTA * 2.0) / 86400.0,
        (z1 - z0) / (DELTA * 2.0) / 86400.0,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sun_coords() {
        let coords = sun_ra_dec_impl(2460207.625 - UNIX_EPOCH + 69.184 / 86400.0);
        assert_eq!(coords, (0.0, 0.0));
    }
}
