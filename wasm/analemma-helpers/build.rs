use std::{env, fs, path::PathBuf, sync::Arc};

fn main() {
    let data_dir = PathBuf::from("data");
    if !data_dir.exists() {
        fs::create_dir(&data_dir).unwrap();
        assert!(data_dir.exists());
    }
    let eph_bin = PathBuf::from("data/linux_p1550p2650.440t");
    if !eph_bin.exists() {
        let mut buf = Vec::new();
        ureq::AgentBuilder::new()
            .tls_connector(Arc::new(
                native_tls::TlsConnector::new().expect("failed to create TLS connector"),
            ))
            .build()
            .get("https://ssd.jpl.nasa.gov/ftp/eph/planets/Linux/de440t/linux_p1550p2650.440t")
            .call()
            .unwrap()
            .into_reader()
            .read_to_end(&mut buf)
            .unwrap();
        fs::write(&eph_bin, buf).unwrap();
        assert!(eph_bin.exists());
    }

    const START_EPOCH: f64 = 2287184.5;
    const FINAL_EPOCH: f64 = 2688976.5;
    const REC_N_COEFF: usize = 1122;
    const REC_SIZE: usize = REC_N_COEFF * 8;

    const SUN_START_LOC: usize = 753 - 1;
    const SUN_N_COEFF: usize = 11;
    const SUN_N_SUB: usize = 2;
    const EM_START_LOC: usize = 231 - 1;
    const EM_N_COEFF: usize = 13;
    const EM_N_SUB: usize = 2;
    const MOON_START_LOC: usize = 441 - 1;
    const MOON_N_COEFF: usize = 13;
    const MOON_N_SUB: usize = 8;

    const DESIRED_START_EPOCH: f64 = 2447892.5;
    const DESIRED_FINAL_EPOCH: f64 = 2473459.5;
    const DESIRED_N_COEFF: usize = 7;

    let start_rec_i = (DESIRED_START_EPOCH.clamp(START_EPOCH, FINAL_EPOCH) - START_EPOCH)
        .div_euclid(32.0) as usize;
    let final_rec_i = ((DESIRED_FINAL_EPOCH.clamp(START_EPOCH, FINAL_EPOCH) - START_EPOCH) / 32.0)
        .ceil() as usize;

    let eph = fs::read(eph_bin).unwrap();

    let mut all_coeffs = Vec::with_capacity(
        (final_rec_i - start_rec_i) * (SUN_N_SUB + EM_N_SUB + MOON_N_SUB) * DESIRED_N_COEFF * 3,
    );
    let mut coeffs = [0.0; DESIRED_N_COEFF * 3];
    for i in start_rec_i + 2..final_rec_i + 2 {
        let rec = &eph[i * REC_SIZE..(i + 1) * REC_SIZE];

        for (start_loc, n_coeff, n_sub) in [
            (SUN_START_LOC, SUN_N_COEFF, SUN_N_SUB),
            (EM_START_LOC, EM_N_COEFF, EM_N_SUB),
            (MOON_START_LOC, MOON_N_COEFF, MOON_N_SUB),
        ] {
            for j in 0..n_sub {
                let sub = &rec
                    [(start_loc + j * n_coeff * 3) * 8..(start_loc + (j + 1) * n_coeff * 3) * 8];

                for k in 0..3 {
                    for l in 0..DESIRED_N_COEFF {
                        coeffs[DESIRED_N_COEFF * k + l] = f64::from_le_bytes(
                            sub[(n_coeff * k + l) * 8..(n_coeff * k + l + 1) * 8]
                                .try_into()
                                .unwrap(),
                        );
                    }
                }

                all_coeffs.extend(coeffs);
            }
        }
    }

    let eph_rs = PathBuf::from(env::var("OUT_DIR").unwrap()).join("eph.rs");
    fs::write(eph_rs, format!("{:?}", all_coeffs).as_bytes()).unwrap();
}
