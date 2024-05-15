use nom::{
    branch::alt,
    bytes::complete::{is_a, tag, take_while, take_while_m_n},
    character::complete::{digit1, hex_digit1, oct_digit1, one_of, space0},
    combinator::{eof, map, map_res, opt, recognize, verify},
    multi::{count, separated_list0},
    sequence::{delimited, pair, preceded, separated_pair, terminated, tuple},
    AsChar, IResult,
};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn parse_danmaku_input(i: &str) -> JsValue {
    match parse_sources(i) {
        Ok((_, sources)) => sources
            .serialize(&serde_wasm_bindgen::Serializer::json_compatible())
            .unwrap_or(JsValue::UNDEFINED),
        _ => JsValue::UNDEFINED,
    }
}

#[derive(Serialize)]
struct DanmakuOperation {
    old_duration: f64,
    new_duration: f64,
    offset: f64,
}

impl Default for DanmakuOperation {
    fn default() -> Self {
        Self {
            old_duration: 1.0,
            new_duration: 1.0,
            offset: 0.0,
        }
    }
}

#[derive(Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
enum DanmakuSource<'a> {
    Cid {
        cid: u64,
        #[serde(flatten)]
        op: DanmakuOperation,
    },
    Bvid {
        bvid: &'a str,
        p: u64,
        #[serde(flatten)]
        op: DanmakuOperation,
    },
    Aid {
        aid: u64,
        p: u64,
        #[serde(flatten)]
        op: DanmakuOperation,
    },
    Mdid {
        media_id: u64,
        p: u64,
        #[serde(flatten)]
        op: DanmakuOperation,
    },
    Ssid {
        season_id: u64,
        p: u64,
        #[serde(flatten)]
        op: DanmakuOperation,
    },
    Epid {
        ep_id: u64,
        #[serde(flatten)]
        op: DanmakuOperation,
    },
    /*
    Tvid {
        tvid: u64,
        #[serde(flatten)]
        op: DanmakuOperation,
    },
    */
}

fn digit_u64(i: &str) -> IResult<&str, u64, ()> {
    map_res(digit1, |s: &str| s.parse::<u64>())(i)
}

fn integer_u64(i: &str) -> IResult<&str, u64, ()> {
    alt((
        map_res(preceded(tag("0x"), hex_digit1), |s: &str| {
            u64::from_str_radix(s, 16)
        }),
        map_res(preceded(tag("0o"), oct_digit1), |s: &str| {
            u64::from_str_radix(s, 8)
        }),
        map_res(preceded(tag("0b"), is_a("01")), |s: &str| {
            u64::from_str_radix(s, 2)
        }),
        digit_u64,
    ))(i)
}

fn nonzero_digit_u64(i: &str) -> IResult<&str, u64, ()> {
    verify(digit_u64, |&val| val != 0)(i)
}

fn nonzero_integer_u64(i: &str) -> IResult<&str, u64, ()> {
    verify(integer_u64, |&val| val != 0)(i)
}

fn float_f64(i: &str) -> IResult<&str, f64, ()> {
    map_res(
        recognize(pair(digit1, opt(preceded(tag("."), digit1)))),
        |s: &str| s.parse(),
    )(i)
}

fn parse_p(i: &str) -> IResult<&str, u64, ()> {
    terminated(
        delimited(
            terminated(tag("["), space0),
            map(nonzero_integer_u64, |val| val - 1),
            preceded(space0, tag("]")),
        ),
        space0,
    )(i)
}

fn duration_helper_digit2_u64(i: &str) -> IResult<&str, u64, ()> {
    map_res(
        take_while_m_n(2, 2, |c: char| c.is_dec_digit()),
        |s: &str| s.parse::<u64>(),
    )(i)
}

fn duration_helper_float2_f64(i: &str) -> IResult<&str, f64, ()> {
    map_res(
        recognize(pair(
            take_while_m_n(2, 2, |c: char| c.is_dec_digit()),
            opt(preceded(tag("."), digit1)),
        )),
        |s: &str| s.parse::<f64>(),
    )(i)
}

fn duration(i: &str) -> IResult<&str, f64, ()> {
    alt((
        map(
            separated_pair(
                separated_pair(digit_u64, tag(":"), duration_helper_digit2_u64),
                tag(":"),
                duration_helper_float2_f64,
            ),
            |((h, m), s): ((u64, u64), f64)| h as f64 * 3600.0 + m as f64 * 60.0 + s,
        ),
        map(
            separated_pair(digit_u64, tag(":"), duration_helper_float2_f64),
            |(m, s): (u64, f64)| m as f64 * 60.0 + s,
        ),
        float_f64,
    ))(i)
}

fn nonzero_duration(i: &str) -> IResult<&str, f64, ()> {
    verify(duration, |&val| val != 0.0)(i)
}

fn parse_old_duration(i: &str) -> IResult<&str, f64, ()> {
    terminated(
        preceded(terminated(tag("/"), space0), nonzero_duration),
        space0,
    )(i)
}

fn parse_new_duration(i: &str) -> IResult<&str, f64, ()> {
    terminated(
        preceded(terminated(tag("*"), space0), nonzero_duration),
        space0,
    )(i)
}

fn parse_offset(i: &str) -> IResult<&str, f64, ()> {
    terminated(
        alt((
            preceded(terminated(tag("+"), space0), duration),
            map(preceded(terminated(tag("-"), space0), duration), |val| -val),
        )),
        space0,
    )(i)
}

fn parse_op(i: &str) -> IResult<&str, DanmakuOperation, ()> {
    terminated(
        map(
            tuple((
                opt(parse_old_duration),
                opt(parse_new_duration),
                opt(parse_offset),
            )),
            |(od, nd, offset)| DanmakuOperation {
                old_duration: od.unwrap_or(1.0),
                new_duration: nd.unwrap_or(1.0),
                offset: offset.unwrap_or(0.0),
            },
        ),
        space0,
    )(i)
}

fn parse_nonzero_digit_u64(i: &str) -> IResult<&str, u64, ()> {
    terminated(nonzero_digit_u64, space0)(i)
}

fn parse_bvid(i: &str) -> IResult<&str, &str, ()> {
    terminated(
        recognize(pair(
            tag("BV"),
            count(
                one_of("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"),
                10,
            ),
        )),
        space0,
    )(i)
}

fn parse_aid(i: &str) -> IResult<&str, u64, ()> {
    terminated(preceded(tag("av"), nonzero_digit_u64), space0)(i)
}

fn parse_mdid(i: &str) -> IResult<&str, u64, ()> {
    terminated(preceded(tag("md"), nonzero_digit_u64), space0)(i)
}

fn parse_ssid(i: &str) -> IResult<&str, u64, ()> {
    terminated(preceded(tag("ss"), nonzero_digit_u64), space0)(i)
}

fn parse_epid(i: &str) -> IResult<&str, u64, ()> {
    terminated(preceded(tag("ep"), nonzero_digit_u64), space0)(i)
}

fn parse_bilibili_source(i: &str) -> IResult<&str, DanmakuSource, ()> {
    terminated(
        alt((
            map(tuple((parse_nonzero_digit_u64, parse_op)), |(cid, op)| {
                DanmakuSource::Cid { cid, op }
            }),
            map(
                tuple((parse_bvid, opt(parse_p), parse_op)),
                |(bvid, p, op)| DanmakuSource::Bvid {
                    bvid,
                    p: p.unwrap_or(0),
                    op,
                },
            ),
            map(
                tuple((parse_aid, opt(parse_p), parse_op)),
                |(aid, p, op)| DanmakuSource::Aid {
                    aid,
                    p: p.unwrap_or(0),
                    op,
                },
            ),
            map(
                tuple((parse_mdid, opt(parse_p), parse_op)),
                |(media_id, p, op)| DanmakuSource::Mdid {
                    media_id,
                    p: p.unwrap_or(0),
                    op,
                },
            ),
            map(
                tuple((parse_ssid, opt(parse_p), parse_op)),
                |(season_id, p, op)| DanmakuSource::Ssid {
                    season_id,
                    p: p.unwrap_or(0),
                    op,
                },
            ),
            map(tuple((parse_epid, parse_op)), |(ep_id, op)| {
                DanmakuSource::Epid { ep_id, op }
            }),
        )),
        space0,
    )(i)
}

/*
fn parse_iqiyi_source(i: &str) -> IResult<&str, DanmakuSource, ()> {
    terminated(
        preceded(
            terminated(separated_pair(tag("iqiyi"), space0, tag(":")), space0),
            alt((map(
                tuple((parse_nonzero_digit_u64, parse_op)),
                |(tvid, op)| DanmakuSource::Tvid { tvid, op },
            ),)),
        ),
        space0,
    )(i)
}
*/

fn parse_sources(i: &str) -> IResult<&str, Vec<DanmakuSource>, ()> {
    delimited(
        space0,
        map(
            separated_list0(
                terminated(tag(";"), space0),
                terminated(
                    opt(parse_bilibili_source),
                    opt(preceded(tag("#"), take_while(|c| c != ';'))),
                ),
            ),
            |val| val.into_iter().flatten().collect(),
        ),
        eof,
    )(i)
}
