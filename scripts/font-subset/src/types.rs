use std::{
    fmt::Display,
    ops::{Add, Sub},
    str::FromStr,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct UnicodeRange(u32, u32);

impl UnicodeRange {
    pub fn new(start: u32, end: u32) -> Self {
        assert!(end >= start);

        UnicodeRange(start, end)
    }

    #[inline]
    pub fn count(self) -> u32 {
        self.1 - self.0 + 1
    }

    pub fn to_u32_vec(self) -> Vec<u32> {
        (self.0..=self.1).collect()
    }
}

impl FromStr for UnicodeRange {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let s_ = s.strip_prefix("U+").ok_or(())?;

        if let Some((start, end)) = s_.split_once('-') {
            let start = u32::from_str_radix(start, 16).map_err(|_| ())?;
            let end = u32::from_str_radix(end, 16).map_err(|_| ())?;

            assert!(end > start);
            assert!(end < 0x110000);

            Ok(Self(start, end))
        } else {
            let value = u32::from_str_radix(s_, 16).map_err(|_| ())?;

            assert!(value < 0x110000);

            Ok(Self(value, value))
        }
    }
}

impl Display for UnicodeRange {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if f.alternate() {
            for i in self.0..=self.1 {
                write!(f, "{}", char::from_u32(i).unwrap())?;
            }
            Ok(())
        } else if self.0 == self.1 {
            write!(f, "U+{:02X}", self.0)
        } else {
            write!(f, "U+{:02X}-{:02X}", self.0, self.1)
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UnicodeRanges(Vec<UnicodeRange>);

impl UnicodeRanges {
    pub fn new(mut ranges: Vec<UnicodeRange>) -> Self {
        ranges.sort();

        let mut out = Vec::new();

        if !ranges.is_empty() {
            let mut last_range = ranges[0];

            for range in &ranges[1..] {
                if range.0 <= last_range.1 + 1 {
                    last_range.1 = last_range.1.max(range.1);
                } else {
                    out.push(last_range);
                    last_range = *range;
                }
            }

            out.push(last_range);
        }

        Self(out)
    }

    pub fn count(&self) -> u32 {
        self.0.iter().map(|range| range.count()).sum()
    }

    pub fn to_u32_vec(&self) -> Vec<u32> {
        self.0.iter().flat_map(|range| range.to_u32_vec()).collect()
    }
}

impl FromStr for UnicodeRanges {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Ok(Self(
            s.split(',')
                .map(UnicodeRange::from_str)
                .collect::<Result<_, _>>()?,
        ))
    }
}

impl Display for UnicodeRanges {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        if f.alternate() {
            for range in self.0.iter() {
                range.fmt(f)?;
            }
        } else {
            for (i, range) in self.0.iter().enumerate() {
                range.fmt(f)?;
                if i + 1 != self.0.len() {
                    ",".fmt(f)?;
                }
            }
        }
        Ok(())
    }
}

impl Add<&UnicodeRange> for &UnicodeRange {
    type Output = <UnicodeRange as Add<UnicodeRange>>::Output;

    fn add(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.1 {
            out.push(*self);
            out.push(*rhs);
        } else if rhs.1 < self.0 {
            out.push(*rhs);
            out.push(*self);
        } else {
            out.push(UnicodeRange(self.0.min(rhs.0), self.1.max(rhs.1)));
        }

        UnicodeRanges(out)
    }
}

impl Add<UnicodeRange> for &UnicodeRange {
    type Output = <UnicodeRange as Add<UnicodeRange>>::Output;

    fn add(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.1 {
            out.push(*self);
            out.push(rhs);
        } else if rhs.1 < self.0 {
            out.push(rhs);
            out.push(*self);
        } else {
            out.push(UnicodeRange(self.0.min(rhs.0), self.1.max(rhs.1)));
        }

        UnicodeRanges(out)
    }
}

impl Add<&UnicodeRange> for UnicodeRange {
    type Output = <UnicodeRange as Add<UnicodeRange>>::Output;

    fn add(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.1 {
            out.push(self);
            out.push(*rhs);
        } else if rhs.1 < self.0 {
            out.push(*rhs);
            out.push(self);
        } else {
            out.push(UnicodeRange(self.0.min(rhs.0), self.1.max(rhs.1)));
        }

        UnicodeRanges(out)
    }
}

impl Add<UnicodeRange> for UnicodeRange {
    type Output = UnicodeRanges;

    fn add(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.1 {
            out.push(self);
            out.push(rhs);
        } else if rhs.1 < self.0 {
            out.push(rhs);
            out.push(self);
        } else {
            out.push(UnicodeRange(self.0.min(rhs.0), self.1.max(rhs.1)));
        }

        UnicodeRanges(out)
    }
}

impl Add<&UnicodeRanges> for &UnicodeRange {
    type Output = <UnicodeRange as Add<UnicodeRanges>>::Output;

    fn add(self, rhs: &UnicodeRanges) -> Self::Output {
        let mut out = rhs.0.clone();
        out.push(*self);
        UnicodeRanges::new(out)
    }
}

impl Add<&UnicodeRanges> for UnicodeRange {
    type Output = <UnicodeRange as Add<UnicodeRanges>>::Output;

    fn add(self, rhs: &UnicodeRanges) -> Self::Output {
        let mut out = rhs.0.clone();
        out.push(self);
        UnicodeRanges::new(out)
    }
}

impl Add<UnicodeRanges> for &UnicodeRange {
    type Output = <UnicodeRange as Add<UnicodeRanges>>::Output;

    fn add(self, rhs: UnicodeRanges) -> Self::Output {
        let mut out = rhs.0;
        out.push(*self);
        UnicodeRanges::new(out)
    }
}

impl Add<UnicodeRanges> for UnicodeRange {
    type Output = UnicodeRanges;

    fn add(self, rhs: UnicodeRanges) -> Self::Output {
        let mut out = rhs.0;
        out.push(self);
        UnicodeRanges::new(out)
    }
}

impl Add<&UnicodeRange> for &UnicodeRanges {
    type Output = <UnicodeRanges as Add<UnicodeRange>>::Output;

    fn add(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = self.0.clone();
        out.push(*rhs);
        UnicodeRanges::new(out)
    }
}

impl Add<&UnicodeRange> for UnicodeRanges {
    type Output = <UnicodeRanges as Add<UnicodeRange>>::Output;

    fn add(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = self.0;
        out.push(*rhs);
        UnicodeRanges::new(out)
    }
}

impl Add<UnicodeRange> for &UnicodeRanges {
    type Output = <UnicodeRanges as Add<UnicodeRange>>::Output;

    fn add(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = self.0.clone();
        out.push(rhs);
        UnicodeRanges::new(out)
    }
}

impl Add<UnicodeRange> for UnicodeRanges {
    type Output = UnicodeRanges;

    fn add(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = self.0;
        out.push(rhs);
        UnicodeRanges::new(out)
    }
}

impl Add<&UnicodeRanges> for &UnicodeRanges {
    type Output = <UnicodeRanges as Add<UnicodeRanges>>::Output;

    fn add(self, rhs: &UnicodeRanges) -> Self::Output {
        let mut out = self.0.clone();
        out.extend(rhs.0.clone());
        UnicodeRanges::new(out)
    }
}

impl Add<&UnicodeRanges> for UnicodeRanges {
    type Output = <UnicodeRanges as Add<UnicodeRanges>>::Output;

    fn add(self, rhs: &UnicodeRanges) -> Self::Output {
        let mut out = self.0;
        out.extend(rhs.0.clone());
        UnicodeRanges::new(out)
    }
}

impl Add<UnicodeRanges> for &UnicodeRanges {
    type Output = <UnicodeRanges as Add<UnicodeRanges>>::Output;

    fn add(self, rhs: UnicodeRanges) -> Self::Output {
        let mut out = self.0.clone();
        out.extend(rhs.0);
        UnicodeRanges::new(out)
    }
}

impl Add<UnicodeRanges> for UnicodeRanges {
    type Output = UnicodeRanges;

    fn add(self, rhs: UnicodeRanges) -> Self::Output {
        let mut out = self.0;
        out.extend(rhs.0);
        UnicodeRanges::new(out)
    }
}

impl Sub<&UnicodeRange> for &UnicodeRange {
    type Output = <UnicodeRange as Sub<UnicodeRange>>::Output;

    fn sub(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.0 {
            out.push(UnicodeRange(self.0, (rhs.0 - 1).min(self.1)));
        }
        if rhs.1 < self.1 {
            out.push(UnicodeRange((rhs.1 + 1).max(self.0), self.1))
        }

        UnicodeRanges(out)
    }
}

impl Sub<&UnicodeRange> for UnicodeRange {
    type Output = <UnicodeRange as Sub<UnicodeRange>>::Output;

    fn sub(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.0 {
            out.push(UnicodeRange(self.0, (rhs.0 - 1).min(self.1)));
        }
        if rhs.1 < self.1 {
            out.push(UnicodeRange((rhs.1 + 1).max(self.0), self.1))
        }

        UnicodeRanges(out)
    }
}

impl Sub<UnicodeRange> for &UnicodeRange {
    type Output = <UnicodeRange as Sub<UnicodeRange>>::Output;

    fn sub(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.0 {
            out.push(UnicodeRange(self.0, (rhs.0 - 1).min(self.1)));
        }
        if rhs.1 < self.1 {
            out.push(UnicodeRange((rhs.1 + 1).max(self.0), self.1))
        }

        UnicodeRanges(out)
    }
}

impl Sub for UnicodeRange {
    type Output = UnicodeRanges;

    fn sub(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        if rhs.0 > self.0 {
            out.push(UnicodeRange(self.0, (rhs.0 - 1).min(self.1)));
        }
        if rhs.1 < self.1 {
            out.push(UnicodeRange((rhs.1 + 1).max(self.0), self.1))
        }

        UnicodeRanges(out)
    }
}

impl Sub<&UnicodeRanges> for &UnicodeRange {
    type Output = <UnicodeRange as Sub<UnicodeRanges>>::Output;

    fn sub(self, rhs: &UnicodeRanges) -> Self::Output {
        let intersecting_ranges: Vec<_> = rhs
            .0
            .iter()
            .filter(|rhs_range| rhs_range.0 <= self.1 && rhs_range.1 >= self.0)
            .collect();

        let mut out = Vec::new();

        if !intersecting_ranges.is_empty() {
            let first_intersecting_range = intersecting_ranges[0];
            if first_intersecting_range.0 > self.0 {
                out.push(UnicodeRange(self.0, first_intersecting_range.0 - 1))
            }

            for window in intersecting_ranges.windows(2) {
                out.push(UnicodeRange(window[0].1 + 1, window[1].0 - 1));
            }

            let last_intersecting_range = intersecting_ranges[intersecting_ranges.len() - 1];
            if last_intersecting_range.1 < self.1 {
                out.push(UnicodeRange(last_intersecting_range.1 + 1, self.1))
            }
        } else {
            out.push(*self);
        }

        UnicodeRanges(out)
    }
}

impl Sub<&UnicodeRanges> for UnicodeRange {
    type Output = <UnicodeRange as Sub<UnicodeRanges>>::Output;

    fn sub(self, rhs: &UnicodeRanges) -> Self::Output {
        let intersecting_ranges: Vec<_> = rhs
            .0
            .iter()
            .filter(|rhs_range| rhs_range.0 <= self.1 && rhs_range.1 >= self.0)
            .collect();

        let mut out = Vec::new();

        if !intersecting_ranges.is_empty() {
            let first_intersecting_range = intersecting_ranges[0];
            if first_intersecting_range.0 > self.0 {
                out.push(UnicodeRange(self.0, first_intersecting_range.0 - 1))
            }

            for window in intersecting_ranges.windows(2) {
                out.push(UnicodeRange(window[0].1 + 1, window[1].0 - 1));
            }

            let last_intersecting_range = intersecting_ranges[intersecting_ranges.len() - 1];
            if last_intersecting_range.1 < self.1 {
                out.push(UnicodeRange(last_intersecting_range.1 + 1, self.1))
            }
        } else {
            out.push(self);
        }

        UnicodeRanges(out)
    }
}

impl Sub<UnicodeRanges> for &UnicodeRange {
    type Output = <UnicodeRange as Sub<UnicodeRanges>>::Output;

    fn sub(self, rhs: UnicodeRanges) -> Self::Output {
        let intersecting_ranges: Vec<_> = rhs
            .0
            .iter()
            .filter(|rhs_range| rhs_range.0 <= self.1 && rhs_range.1 >= self.0)
            .collect();

        let mut out = Vec::new();

        if !intersecting_ranges.is_empty() {
            let first_intersecting_range = intersecting_ranges[0];
            if first_intersecting_range.0 > self.0 {
                out.push(UnicodeRange(self.0, first_intersecting_range.0 - 1))
            }

            for window in intersecting_ranges.windows(2) {
                out.push(UnicodeRange(window[0].1 + 1, window[1].0 - 1));
            }

            let last_intersecting_range = intersecting_ranges[intersecting_ranges.len() - 1];
            if last_intersecting_range.1 < self.1 {
                out.push(UnicodeRange(last_intersecting_range.1 + 1, self.1))
            }
        } else {
            out.push(*self);
        }

        UnicodeRanges(out)
    }
}

impl Sub<UnicodeRanges> for UnicodeRange {
    type Output = UnicodeRanges;

    fn sub(self, rhs: UnicodeRanges) -> Self::Output {
        let intersecting_ranges: Vec<_> = rhs
            .0
            .iter()
            .filter(|rhs_range| rhs_range.0 <= self.1 && rhs_range.1 >= self.0)
            .collect();

        let mut out = Vec::new();

        if !intersecting_ranges.is_empty() {
            let first_intersecting_range = intersecting_ranges[0];
            if first_intersecting_range.0 > self.0 {
                out.push(UnicodeRange(self.0, first_intersecting_range.0 - 1))
            }

            for window in intersecting_ranges.windows(2) {
                out.push(UnicodeRange(window[0].1 + 1, window[1].0 - 1));
            }

            let last_intersecting_range = intersecting_ranges[intersecting_ranges.len() - 1];
            if last_intersecting_range.1 < self.1 {
                out.push(UnicodeRange(last_intersecting_range.1 + 1, self.1))
            }
        } else {
            out.push(self);
        }

        UnicodeRanges(out)
    }
}

impl Sub<&UnicodeRange> for &UnicodeRanges {
    type Output = <UnicodeRanges as Sub<UnicodeRange>>::Output;

    fn sub(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0.iter() {
            if rhs.0 <= range.1 && rhs.1 >= range.0 {
                out.extend((range - rhs).0);
            } else {
                out.push(*range);
            }
        }

        UnicodeRanges(out)
    }
}

impl Sub<&UnicodeRange> for UnicodeRanges {
    type Output = <UnicodeRanges as Sub<UnicodeRange>>::Output;

    fn sub(self, rhs: &UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0 {
            if rhs.0 <= range.1 && rhs.1 >= range.0 {
                out.extend((range - rhs).0);
            } else {
                out.push(range);
            }
        }

        UnicodeRanges(out)
    }
}

impl Sub<UnicodeRange> for &UnicodeRanges {
    type Output = <UnicodeRanges as Sub<UnicodeRange>>::Output;

    fn sub(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0.iter() {
            if rhs.0 <= range.1 && rhs.1 >= range.0 {
                out.extend((range - rhs).0);
            } else {
                out.push(*range);
            }
        }

        UnicodeRanges(out)
    }
}

impl Sub<UnicodeRange> for UnicodeRanges {
    type Output = UnicodeRanges;

    fn sub(self, rhs: UnicodeRange) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0 {
            if rhs.0 <= range.1 && rhs.1 >= range.0 {
                out.extend((range - rhs).0);
            } else {
                out.push(range);
            }
        }

        UnicodeRanges(out)
    }
}

impl Sub<&UnicodeRanges> for &UnicodeRanges {
    type Output = <UnicodeRanges as Sub<UnicodeRanges>>::Output;

    fn sub(self, rhs: &UnicodeRanges) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0.iter() {
            out.extend((range - rhs).0);
        }

        UnicodeRanges(out)
    }
}

impl Sub<&UnicodeRanges> for UnicodeRanges {
    type Output = <UnicodeRanges as Sub<UnicodeRanges>>::Output;

    fn sub(self, rhs: &UnicodeRanges) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0 {
            out.extend((range - rhs).0);
        }

        UnicodeRanges(out)
    }
}

impl Sub<UnicodeRanges> for &UnicodeRanges {
    type Output = <UnicodeRanges as Sub<UnicodeRanges>>::Output;

    fn sub(self, rhs: UnicodeRanges) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0.iter() {
            out.extend((range - &rhs).0);
        }

        UnicodeRanges(out)
    }
}

impl Sub<UnicodeRanges> for UnicodeRanges {
    type Output = UnicodeRanges;

    fn sub(self, rhs: UnicodeRanges) -> Self::Output {
        let mut out = Vec::new();

        for range in self.0 {
            out.extend((range - &rhs).0);
        }

        UnicodeRanges(out)
    }
}
