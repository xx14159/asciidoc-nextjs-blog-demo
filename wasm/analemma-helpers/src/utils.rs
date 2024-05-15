use std::cmp::Ordering;

pub fn chebyshev_6(t: f64, &[c0, c1, c2, c3, c4, c5, c6]: &[f64; 7]) -> f64 {
    [
        c0,
        c1 * t,
        c2 * (2.0 * t.powi(2) - 1.0),
        c3 * (4.0 * t.powi(3) - 3.0 * t),
        c4 * (8.0 * t.powi(4) - 8.0 * t.powi(2) + 1.0),
        c5 * (16.0 * t.powi(5) - 20.0 * t.powi(3) + 5.0 * t),
        c6 * (32.0 * t.powi(6) - 48.0 * t.powi(4) + 18.0 * t.powi(2) - 1.0),
    ]
    .into_iter()
    .sum()
}

#[inline]
fn arrange(a: f64, ya: f64, b: f64, yb: f64) -> (f64, f64, f64, f64) {
    if ya.abs() < yb.abs() {
        (b, yb, a, ya)
    } else {
        (a, ya, b, yb)
    }
}

/// Modified from [find_root_brent](https://docs.rs/roots/latest/src/roots/numerical/brent.rs.html#57-135).
pub fn find_root_brent<F>(t_left: f64, t_right: f64, mut f: F) -> Option<f64>
where
    F: FnMut(f64) -> f64,
{
    let (mut a, mut ya, mut b, mut yb) = arrange(t_left, f(t_left), t_right, f(t_right));
    if matches!((ya * yb).partial_cmp(&0.0), Some(Ordering::Greater) | None) {
        return None;
    }

    let (mut c, mut yc, mut d) = (a, ya, a);
    let mut flag = true;

    loop {
        if yb == 0.0 {
            return Some(b);
        }
        let mut s = if (ya != yc) && (yb != yc) {
            a * yb * yc / ((ya - yb) * (ya - yc))
                + b * ya * yc / ((yb - ya) * (yb - yc))
                + c * ya * yb / ((yc - ya) * (yc - yb))
        } else {
            b - yb * (b - a) / (yb - ya)
        };

        let cond1 = (s - b) * (s - (3.0 * a + b) / 4.0) > 0.0;
        let cond2 = flag && (s - b).abs() >= (b - c).abs() / 2.0;
        let cond3 = !flag && (s - b).abs() >= (c - d).abs() / 2.0;
        let cond4 = flag && b == c;
        let cond5 = !flag && c == d;

        if cond1 || cond2 || cond3 || cond4 || cond5 {
            s = (a + b) / 2.0;
            flag = true;
        } else {
            flag = false;
        }

        if (s == a || s == b) && b == c && c == d {
            return Some(b);
        }

        let ys = f(s);
        if ys.is_nan() {
            return None;
        }
        d = c;
        c = b;
        yc = yb;
        if ya * ys < 0.0 {
            // Root bracketed between a and s
            (a, ya, b, yb) = arrange(a, ya, s, ys);
        } else {
            // Root bracketed between s and b
            (a, ya, b, yb) = arrange(s, ys, b, yb);
        }
    }
}
