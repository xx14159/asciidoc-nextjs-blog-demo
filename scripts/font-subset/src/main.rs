mod types;

use std::{
    fs::File,
    io::{Read, Result, Write},
    str::FromStr,
};

use rand::prelude::*;

use crate::types::{UnicodeRange, UnicodeRanges};

const N_SUB_CHUNK: u32 = 4;

const CJK_LEVEL1_CHARS_PER_FILE: u32 = 384;
const CJK_LEVEL2_CHARS_PER_FILE: u32 = 256;
const CJK_LEVEL3_CHARS_PER_FILE: u32 = 128;

const BLOCKS: [&str; 8] = [
    // CJK Unified Ideographs Extension A
    // CJK Unified Ideographs
    // CJK Compatibility Ideographs
    // CJK Unified Ideographs Extension B
    // CJK Unified Ideographs Extension C
    // CJK Unified Ideographs Extension D
    // CJK Unified Ideographs Extension E
    // CJK Unified Ideographs Extension F
    // CJK Compatibility Ideographs Supplement
    // CJK Unified Ideographs Extension G
    // CJK Unified Ideographs Extension H
    "U+3400-4DBF,U+4E00-9FFF,U+F900-FAFF,U+20000-2A6DF,U+2A700-2EBEF,U+2F800-2FA1F,U+30000-323AF",
    // Hangul Syllables
    "U+AC00-D7AF",
    // (Part of) Enclosed CJK Letters and Months
    // Enclosed Ideographic Supplement
    "U+3200-3247,U+3260-327E,U+3280-32B0,U+32D0-32FE,U+1F200-1F2FF",
    // (Part of) Enclosed CJK Letters and Months
    // CJK Compatibility
    "U+32C0-32CE,U+32FF-33FF",
    // CJK Radicals Supplement
    // Kangxi Radicals
    // CJK Strokes
    "U+2E80-2FDF,U+31C0-31EF",
    // Bopomofo
    // Bopomofo Extended
    "U+3100-312F,U+31A0-31BF",
    // Hiragana
    // Katakana
    // Kanbun
    // Katakana Phonetic Extensions
    // (Part of) Halfwidth and Fullwidth Forms
    // Kana Extended-B
    // Kana Supplement
    // Kana Extended-A
    // Small Kana Extension
    "U+3040-30FF,U+3190-319F,U+31F0-31FF,U+FF65-FF9F,U+1AFF0-1B16F",
    // Hangul Jamo
    // Hangul Compatibility Jamo
    // Hangul Jamo Extended-A
    // Hangul Jamo Extended-B
    // (Part of) Halfwidth and Fullwidth Forms
    "U+1100-11FF,U+3130-318F,U+A960-A97F,U+D7B0-D7FF,U+FFA0-FFDC",
];

const EXT: &str = ".otf.woff2";

const ADDITIONAL_ARGS: &str =
    "--no-ignore-missing-unicodes --flavor=woff2 --notdef-outline --layout-features=* --drop-tables= --passthrough-tables";

fn main() -> Result<()> {
    let mut commands = vec!["#!/bin/bash\n".to_string()];
    let mut font_face_rules = Vec::new();

    for (font_code_points_path, n_code_points, font_path, font_name) in [
        (
            "data/source-han-serif",
            44748,
            "fonts/SourceHanSerif/SourceHanSerifSC-VF",
            "SHSerifSCVF-anbd",
        ),
        (
            "data/source-han-sans",
            44812,
            "fonts/SourceHanSans/SourceHanSansSC-VF",
            "SHSansSCVF-anbd",
        ),
    ] {
        println!(":: {font_name}");

        let mut buffer = String::new();
        let mut f = File::open(font_code_points_path)?;
        f.read_to_string(&mut buffer)?;

        let font_charset = UnicodeRanges::from_str(&buffer).unwrap();
        let mut excluding_set = UnicodeRange::new(0, 0x10ffff) - &font_charset;
        assert_eq!(0x110000 - excluding_set.count(), n_code_points);

        let mut blocks = Vec::new();

        for (charset_path, level1_idx_range, level2_idx_range, level1_count, level2_count) in [
            ("data/cjk-ideographs/gb2312", 0..40, 40..72, 3755, 3008),
            ("data/cjk-ideographs/gbt12345", 0..40, 40..74, 3755, 3111),
            ("data/cjk-ideographs/big5", 0..35, 35..84, 5401, 7652),
            // ("data/cjk-ideographs/cns11643", 0..58, 58..140, 5401, 7650),
            ("data/cjk-ideographs/jisx0208", 0..32, 32..69, 2965, 3390),
            ("data/cjk-ideographs/ksx1001", 0..52, 52..52, 4888, 0),
            ("data/cjk-ideographs/ksx1002", 0..0, 0..31, 0, 2856),
            ("data/cjk-ideographs/tcvn6056", 0..36, 36..36, 3311, 0),
            ("data/hanguls/ksx1001", 0..25, 25..25, 2350, 0),
            ("data/hanguls/ksx1002", 0..0, 0..21, 0, 1930),
            // ("data/hanguls/gb12052", 0..37, 37..37, 3424, 0),
        ] {
            buffer.clear();
            let mut f = File::open(charset_path)?;
            f.read_to_string(&mut buffer)?;

            let lines: Vec<_> = buffer.split('\n').collect();
            let level1 = UnicodeRanges::new(
                lines[level1_idx_range]
                    .join("")
                    .chars()
                    .map(|c| UnicodeRange::new(c as u32, c as u32))
                    .collect(),
            );
            let level2 = UnicodeRanges::new(
                lines[level2_idx_range]
                    .join("")
                    .chars()
                    .map(|c| UnicodeRange::new(c as u32, c as u32))
                    .collect(),
            );
            assert_eq!(level1.count(), level1_count);
            assert_eq!(level2.count(), level2_count);

            let factor = if charset_path.contains("hanguls") {
                2
            } else {
                1
            };

            let level1_unique = &level1 - &excluding_set;
            if level1_unique.count() > 0 {
                blocks.push((1, factor, level1_unique));
            }
            excluding_set = excluding_set + level1;

            let level2_unique = &level2 - &excluding_set;
            if level2_unique.count() > 0 {
                blocks.push((2, factor, level2_unique));
            }
            excluding_set = excluding_set + level2;
        }
        buffer.clear();

        for (block_str, factor) in BLOCKS[..2].iter().zip([1, 2]) {
            let level3 = UnicodeRanges::from_str(block_str).unwrap();
            let level3_unique = &level3 - &excluding_set;
            if level3_unique.count() > 0 {
                blocks.push((3, factor, level3_unique));
            }
            excluding_set = excluding_set + level3;
        }

        let mut rng = StdRng::seed_from_u64(42);

        let mut ranges = Vec::new();

        let mut total_file_count = 0;
        for (level, factor, block) in blocks {
            let n_chunk = match level {
                1 => (block.count() - 1) / (CJK_LEVEL1_CHARS_PER_FILE * factor) + 1,
                2 => (block.count() - 1) / (CJK_LEVEL2_CHARS_PER_FILE * factor) + 1,
                _ => (block.count() - 1) / (CJK_LEVEL3_CHARS_PER_FILE * factor) + 1,
            } * N_SUB_CHUNK;
            let chunk_size = (block.count() + n_chunk - 1) / n_chunk;
            let n_in_full_chunk = (n_chunk - (chunk_size * n_chunk - block.count())) * chunk_size;

            let vec = block.to_u32_vec();
            let mut chunks: Vec<_> = vec[..n_in_full_chunk.try_into().unwrap()]
                .chunks(chunk_size.try_into().unwrap())
                .collect();
            chunks.extend(
                vec[n_in_full_chunk.try_into().unwrap()..]
                    .chunks((chunk_size - 1).try_into().unwrap()),
            );
            chunks.shuffle(&mut rng);
            let chunks = chunks.chunks(N_SUB_CHUNK.try_into().unwrap());

            let local_file_count = chunks.len();
            total_file_count += local_file_count;
            print!(
                "level{level}: {local_file_count:3} files, {total_file_count:3} files in total, {:5} = ",
                block.count()
            );

            let mut prev_count = 0;
            let mut n_same = 0;
            for chunk in chunks {
                let mut range_vec = Vec::new();
                for sub_chunk in chunk {
                    range_vec.extend(
                        sub_chunk
                            .iter()
                            .map(|&c| UnicodeRange::new(c, c))
                            .collect::<Vec<_>>(),
                    );
                }
                let range = UnicodeRanges::new(range_vec);

                let current_count = range.count();
                if current_count == prev_count {
                    n_same += 1;
                } else {
                    if prev_count != 0 {
                        if n_same == 1 {
                            print!("{} + ", prev_count);
                        } else {
                            print!("{} * {} + ", prev_count, n_same);
                        }
                    }
                    prev_count = current_count;
                    n_same = 1;
                }

                ranges.push(range);
            }
            if n_same == 1 {
                println!("{}", prev_count);
            } else {
                println!("{} * {}", prev_count, n_same);
            }
        }

        for block_str in &BLOCKS[2..] {
            let block = UnicodeRanges::from_str(block_str).unwrap();
            let block_unique = &block - &excluding_set;
            if block_unique.count() > 0 {
                total_file_count += 1;
                println!(
                    "block:  {:3} files, {total_file_count:3} files in total, {:5}",
                    1,
                    block_unique.count()
                );
                ranges.push(block_unique);
            }
            excluding_set = excluding_set + block;
        }

        let rest = UnicodeRange::new(0, 0x10ffff) - &excluding_set;
        total_file_count += 1;
        println!(
            "rest:   {:3} files, {total_file_count:3} files in total, {:5}",
            1,
            rest.count()
        );
        ranges.insert(0, rest);

        assert_eq!(
            ranges
                .clone()
                .into_iter()
                .reduce(|acc, range| acc + range)
                .unwrap(),
            font_charset
        );

        for (i, range) in ranges.into_iter().enumerate() {
            commands.push(format!("pyftsubset ./public/{font_path}{EXT} --unicodes={range} --output-file=./public/{font_path}.p{i}{EXT} {ADDITIONAL_ARGS}"));

            font_face_rules.push(format!(
                r#"@font-face {{
  font-family: "{font_name}";
  font-style: normal;
  font-weight: 250 900;
  font-display: swap;
  src: url("https://otherx.blog/{font_path}.p{i}{EXT}") format("woff2");
  unicode-range: {range};
}}"#
            ))
        }
        commands.push(String::new());
        font_face_rules.push(String::new());
    }

    let mut f = File::options()
        .write(true)
        .truncate(true)
        .create(true)
        .open("../../.tmp/font-subset")?;
    f.write_all(commands.join("\n").as_bytes())?;

    let mut f = File::options()
        .write(true)
        .truncate(true)
        .create(true)
        .open("../../styles/fonts-generated.css")?;
    f.write_all(font_face_rules.join("\n").as_bytes())?;

    Ok(())
}
