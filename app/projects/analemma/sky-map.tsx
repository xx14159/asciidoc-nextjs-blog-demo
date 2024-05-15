import * as d3 from "d3";
import concat from "lodash/concat";
import range from "lodash/range";

import { findRootBrent } from "./utils";

const totalWidth = 968;
const totalHeight = 620;
const margin = 21;
const xLeft = margin;
const xRight = totalWidth - margin;
const yTop = margin;
const yBottom = totalHeight - margin;

const padding = 80;

const insideLabelOffset = 6;
const outsideLabelOffset = 5;
const charWidth = 1200 / 1950;
const charHeight = 1374 / 1950;

const SkyMap = ({ data }: { data: number[][] }) => {
  const analemma = data.map(([az, alt]) => [az, alt]);
  const [azC, altC] = d3.geoCentroid({
    type: "MultiPoint",
    coordinates: analemma,
  });

  const altCenter = altC > 55 ? 90 : altC < -55 ? -90 : 0;
  const nearestDirection = (() => {
    if (azC > -135 && azC <= -45) return -90;
    if (azC > -45 && azC <= 45) return 0;
    if (azC > 45 && azC <= 135) return 90;
    else return 180;
  })();

  const proj = d3
    .geoStereographic()
    .clipExtent([
      [xLeft, yTop],
      [xRight, yBottom],
    ])
    .precision(0.05);
  if (altCenter === 0) {
    proj.rotate([-azC, 0]).fitExtent(
      [
        [xLeft + padding, yTop + padding],
        [xRight - padding * 2, yBottom - padding * 2],
      ],
      {
        type: "MultiPoint",
        coordinates: concat(analemma, [[nearestDirection, 0]]),
      },
    );
  } else {
    proj.rotate([altCenter + 90, -altCenter]).fitExtent(
      [
        [xLeft + padding, yTop + padding],
        [xRight - padding * 2, yBottom - padding * 2],
      ],
      {
        type: "MultiPoint",
        coordinates: concat(analemma, [
          [0, altCenter],
          [0, altCenter - 10 * Math.sign(altCenter)],
          [90, altCenter - 10 * Math.sign(altCenter)],
          [180, altCenter - 10 * Math.sign(altCenter)],
          [270, altCenter - 10 * Math.sign(altCenter)],
        ]),
      },
    );
  }

  const path = d3.geoPath(proj);
  const graticule = d3.geoGraticule().stepMinor([15, 10]).precision(0.05);
  const ground = d3.geoCircle().radius(90).center([0, -90]).precision(0.05);

  const pointRadius = (() => {
    const r = proj.rotate();
    const [x, y] = proj([-r[0], -r[1]]) as [number, number];
    const [x1, y1] = proj([-r[0], -r[1] + 0.533 / 2]) as [number, number];
    return Math.hypot(x1 - x, y1 - y);
  })();

  const [azSummerSolstice, altSummerSolstice] = data.find(
    (d) => d[4] === 6 && d[5] === 21,
  ) as number[];
  const [xSummerSolstice, ySummerSolstice] = proj([
    azSummerSolstice,
    altSummerSolstice,
  ]) as [number, number];
  const [azWinterSolstice, altWinterSolstice] = data.find(
    (d) => d[4] === 12 && d[5] === 21,
  ) as number[];
  const [xWinterSolstice, yWinterSolstice] = proj([
    azWinterSolstice,
    altWinterSolstice,
  ]) as [number, number];
  let rotateAngle =
    (90 -
      (Math.atan2(
        ySummerSolstice - yWinterSolstice,
        xWinterSolstice - xSummerSolstice,
      ) /
        Math.PI) *
        180) %
    180;
  if (rotateAngle < -90) rotateAngle += 180;
  if (rotateAngle > 90) rotateAngle -= 180;

  return (
    <svg
      className="tw-m-[calc(-125%/58)]"
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
    >
      <path
        className="tw-fill-none tw-stroke-gray-700/60 tw-stroke-1"
        d={path(graticule()) ?? undefined}
      />
      <path className="tw-fill-gray-300/60" d={path(ground()) ?? undefined} />
      <Horizon path={path} />
      {altCenter === 0 ? (
        <DirectionsOnHorizon proj={proj} />
      ) : (
        <DirectionsOnEdge proj={proj} />
      )}
      <path
        className="tw-fill-none tw-stroke-gray-900 tw-stroke-2"
        d={(() => {
          const border = d3.path();
          border.moveTo(xLeft, yTop);
          border.lineTo(xRight, yTop);
          border.lineTo(xRight, yBottom);
          border.lineTo(xLeft, yBottom);
          border.closePath();
          return border.toString();
        })()}
      />
      <GraticuleLabels proj={proj} />

      <path
        className="tw-fill-none tw-stroke-orange-600/60 tw-stroke-[0.5]"
        d={
          path.pointRadius(pointRadius)({
            type: "MultiPoint",
            coordinates: data.map(([az, alt]) => [az, alt]),
          }) ?? undefined
        }
      />
      <path
        className="tw-fill-none tw-stroke-orange-600 tw-stroke-[1.5]"
        d={
          path.pointRadius(pointRadius)({
            type: "MultiPoint",
            coordinates: data
              .filter((d) => d[5] === 1)
              .map(([az, alt]) => [az, alt]),
          }) ?? undefined
        }
      />
      <g>
        {data
          .filter((d) => d[5] === 1)
          .map(([az, alt, hourAngle, localSiderealTime, month, date]) => {
            const [x, y] = proj([az, alt]) as [number, number];
            let theOtherSide = (month >= 5 && month <= 6) || month >= 9;
            if (ySummerSolstice > yWinterSolstice) theOtherSide = !theOtherSide;

            return (
              <text
                key={month}
                className="tw-fill-gray-900/80 tw-font-mono tw-text-xs tw-font-medium tw-leading-normal"
                x={x}
                y={y}
                dx={(theOtherSide ? 1 : -1) * (pointRadius + insideLabelOffset)}
                dy={(12 * charHeight) / 2}
                textAnchor={theOtherSide ? "start" : "end"}
                transform={`rotate(${rotateAngle},${x},${y})`}
              >
                {
                  new Date(`2000-${month.toString().padStart(2,"0")}-${date.toString().padStart(2,"0")}`)
                    .toLocaleString("en", {
                      dateStyle: "medium",
                    })
                    .split(",")[0]
                }
              </text>
            );
          })}
      </g>
    </svg>
  );
};

export default SkyMap;

const Horizon = ({ path }: { path: d3.GeoPath }) => (
  <path
    className="tw-fill-none tw-stroke-gray-900/60 tw-stroke-2"
    d={
      path({
        type: "LineString",
        coordinates: [
          [0, 0],
          [90, 0],
          [180, 0],
          [270, 0],
          [0, 0],
        ],
      }) ?? undefined
    }
  />
);

const DirectionsOnHorizon = ({ proj }: { proj: d3.GeoProjection }) => (
  <g>
    {[
      { az: 0, letter: "N" },
      { az: 90, letter: "E" },
      { az: 180, letter: "S" },
      { az: 270, letter: "W" },
    ].map(({ az, letter }) => {
      const [x, y] = proj([az, 0]) as [number, number];

      const fontSize = 14;
      const padding = 4;
      const width = fontSize * charWidth + padding * 2;
      const height = fontSize * charHeight + padding * 2;
      return (
        <g key={letter}>
          <rect
            className="tw-fill-gray-900/60"
            x={x - width / 2}
            y={y - insideLabelOffset - height}
            width={width}
            height={height}
          />
          <text
            className="tw-fill-white tw-font-mono tw-text-sm tw-font-bold tw-leading-normal"
            x={x}
            y={y - insideLabelOffset - padding}
            textAnchor="middle"
          >
            {letter}
          </text>
        </g>
      );
    })}
  </g>
);

const DirectionsOnEdge = ({ proj }: { proj: d3.GeoProjection }) => (
  <g>
    {(() => {
      const [azCenter, altCenter] = proj.rotate().map((d) => -d);
      const [xCenter, yCenter] = proj([azCenter, altCenter]) as [
        number,
        number,
      ];

      const fontSize = 14;
      const padding = 4;
      const width = fontSize * charWidth + padding * 2;
      const height = fontSize * charHeight + padding * 2;

      const xOffset = insideLabelOffset + width / 2;
      const yOffset = insideLabelOffset + height / 2;

      return [
        {
          x: xCenter,
          y: yTop + yOffset,
          letter: "N",
        },
        {
          x: altCenter > 0 ? xLeft + xOffset : xRight - xOffset,
          y: yCenter,
          letter: "E",
        },
        {
          x: xCenter,
          y: yBottom - yOffset,
          letter: "S",
        },
        {
          x: altCenter > 0 ? xRight - xOffset : xLeft + xOffset,
          y: yCenter,
          letter: "W",
        },
      ].map(({ x, y, letter }) => (
        <g key={letter}>
          <rect
            className="tw-fill-gray-900/60"
            x={x - width / 2}
            y={y - height / 2}
            width={width}
            height={height}
          />
          <text
            className="tw-fill-white tw-font-mono tw-text-sm tw-font-bold tw-leading-normal"
            x={x}
            y={y + (fontSize * charHeight) / 2}
            textAnchor="middle"
          >
            {letter}
          </text>
        </g>
      ));
    })()}
  </g>
);

type Position =
  | { side: "top"; sub: "left" | "right" | null }
  | { side: "bottom"; sub: "left" | "right" | null }
  | { side: "left"; sub: "top" | "bottom" | null }
  | { side: "right"; sub: "top" | "bottom" | null };

type GraticuleLabelDataType = {
  pos: Position;
  kind: "az" | "az+" | "az-" | "alt";
  x: number;
  y: number;
  label: string;
  rotate: number;
};

type Segment = {
  p0: [number, number];
  p1: [number, number];
  pos: Position;
};

const getSegments = (xCenter?: number, yCenter?: number) => {
  const segments = [] as Segment[];
  const o = 1;
  if (xCenter !== undefined && xLeft + o < xCenter && xCenter < xRight - o) {
    segments.push({
      p0: [xLeft + o, yTop + o],
      p1: [xCenter, yTop + o],
      pos: { side: "top", sub: "left" },
    });
    segments.push({
      p0: [xCenter, yTop + o],
      p1: [xRight - o, yTop + o],
      pos: { side: "top", sub: "right" },
    });
  } else {
    segments.push({
      p0: [xLeft + o, yTop + o],
      p1: [xRight - o, yTop + o],
      pos: { side: "top", sub: null },
    });
  }
  if (yCenter !== undefined && yTop + o < yCenter && yCenter < yBottom - o) {
    segments.push({
      p0: [xRight - o, yTop + o],
      p1: [xRight - o, yCenter],
      pos: { side: "right", sub: "top" },
    });
    segments.push({
      p0: [xRight - o, yCenter],
      p1: [xRight - o, yBottom - o],
      pos: { side: "right", sub: "bottom" },
    });
  } else {
    segments.push({
      p0: [xRight - o, yTop + o],
      p1: [xRight - o, yBottom - o],
      pos: { side: "right", sub: null },
    });
  }
  if (xCenter !== undefined && xLeft + o < xCenter && xCenter < xRight - o) {
    segments.push({
      p0: [xRight - o, yBottom - o],
      p1: [xCenter, yBottom - o],
      pos: { side: "bottom", sub: "right" },
    });
    segments.push({
      p0: [xCenter, yBottom - o],
      p1: [xLeft + o, yBottom - o],
      pos: { side: "bottom", sub: "left" },
    });
  } else {
    segments.push({
      p0: [xRight - o, yBottom - o],
      p1: [xLeft + o, yBottom - o],
      pos: { side: "bottom", sub: null },
    });
  }
  if (yCenter !== undefined && yTop + o < yCenter && yCenter < yBottom - o) {
    segments.push({
      p0: [xLeft + o, yBottom - o],
      p1: [xLeft + o, yCenter],
      pos: { side: "left", sub: "bottom" },
    });
    segments.push({
      p0: [xLeft + o, yCenter],
      p1: [xLeft + o, yTop + o],
      pos: { side: "left", sub: "top" },
    });
  } else {
    segments.push({
      p0: [xLeft + o, yBottom - o],
      p1: [xLeft + o, yTop + o],
      pos: { side: "left", sub: null },
    });
  }
  return segments;
};

const offsetLabel = (x: number, y: number, pos: Position, fontSize: number) => {
  if (pos.side === "top") return [x, yTop - outsideLabelOffset];
  else if (pos.side === "bottom")
    return [x, yBottom + outsideLabelOffset + fontSize * charHeight];
  else if (pos.side === "left") return [xLeft - outsideLabelOffset, y];
  else return [xRight + outsideLabelOffset, y];
};

const getRotateAngle = (pos: Position) => {
  if (pos.side === "top" || pos.side === "bottom") return 0;
  else if (pos.side === "left") return -90;
  else return 90;
};

const avoidCollision = (
  tree: d3.Quadtree<GraticuleLabelDataType>,
  d: GraticuleLabelDataType,
  fontSize: number,
) => {
  const neighbor = tree.find(d.x, d.y);
  if (neighbor !== undefined) {
    if ((d.y <= yTop || d.y >= yBottom) && neighbor.y === d.y) {
      const needSpace =
        ((neighbor.label.length + d.label.length) / 2) * fontSize * charWidth -
        Math.abs(neighbor.x - d.x);
      if (needSpace > 0) {
        tree.remove(neighbor);
        const move = (Math.sign(neighbor.x - d.x) * needSpace) / 2;
        neighbor.x += move;
        d.x -= move;
        tree.add(neighbor);
      }
    } else if ((d.x <= xLeft || d.x >= xRight) && neighbor.x === d.x) {
      const needSpace =
        ((neighbor.label.length + d.label.length) / 2) * fontSize * charWidth -
        Math.abs(neighbor.y - d.y);
      if (needSpace > 0) {
        tree.remove(neighbor);
        const move = (Math.sign(neighbor.y - d.y) * needSpace) / 2;
        neighbor.y += move;
        d.y -= move;
        tree.add(neighbor);
      }
    }
  }
  tree.add(d);
};

const placeGraticuleLabels = (proj: d3.GeoProjection, fontSize: number) => {
  if (proj.invert === undefined) return null;
  const invert = proj.invert;

  const [azCenter, altCenter] = proj.rotate().map((d) => -d);
  const [xCenter, yCenter] = proj([azCenter, altCenter]) as [number, number];

  const azSegments = getSegments();
  const altSegments = getSegments(xCenter, yCenter);

  const res = [] as GraticuleLabelDataType[];
  const tree = d3.quadtree(
    res,
    (d) => d.x,
    (d) => d.y,
  );

  for (const { p0, p1, pos } of azSegments) {
    const t2xy = (t: number, az: number, dir: 1 | 0 | -1) => {
      const alt = dir === 0 ? 160 * t - 80 : 80 * t * dir;
      const [x, y] = proj([az, alt]) as [number, number];
      return [x, y];
    };

    for (const az of range(0, 359, 15)) {
      for (const dir of (altCenter === 0 ? [-1, 1] : [0]) as (-1 | 0 | 1)[]) {
        const [x0, y0] = t2xy(0, az, dir);
        const [x1, y1] = t2xy(1, az, dir);
        if (
          pos.side === "top" || pos.side === "bottom"
            ? (y0 - p1[1] + 1) * (y1 - p1[1] + 1) > 0 ||
              (y0 - p1[1] - 1) * (y1 - p1[1] - 1) > 0
            : (x0 - p1[0] + 1) * (x1 - p1[0] + 1) > 0 ||
              (x0 - p1[0] - 1) * (x1 - p1[0] - 1) > 0
        )
          continue;
        let t = findRootBrent(0, 1, (t) =>
          pos.side === "top" || pos.side === "bottom"
            ? t2xy(t, az, dir)[1] - p1[1]
            : t2xy(t, az, dir)[0] - p1[0],
        );
        if (t === null) continue;
        const [xt, yt] = t2xy(t, az, dir);
        if (
          pos.side === "top" || pos.side === "bottom"
            ? (xt - p0[0]) * (xt - p1[0]) > 0
            : (yt - p0[1]) * (yt - p1[1]) > 0
        )
          continue;
        const [x, y] = offsetLabel(xt, yt, pos, fontSize);
        const newD = {
          pos,
          kind: dir === 0 ? "az" : dir > 0 ? "az+" : "az-",
          x,
          y,
          label: `${az}°`,
          rotate: getRotateAngle(pos),
        } as GraticuleLabelDataType;
        avoidCollision(tree, newD, fontSize);
        res.push(newD);
      }
    }
  }

  for (const { p0, p1, pos } of altSegments) {
    const t2xy = (t: number) => {
      const x = p0[0] * (1 - t) + p1[0] * t;
      const y = p0[1] * (1 - t) + p1[1] * t;
      return [x, y];
    };
    const t2AzAlt = (t: number, xo: number = 0, yo: number = 0) => {
      const [x, y] = t2xy(t);
      const [az, alt] = invert([x + xo, y + yo]) as [number, number];
      return [az, alt, x, y];
    };

    for (const alt of range(-80, 81, 10)) {
      if (pos.side === "top" || pos.side === "bottom") {
        if (
          (alt - t2AzAlt(0, 0, 1)[1]) * (alt - t2AzAlt(1, 0, 1)[1]) > 0 ||
          (alt - t2AzAlt(0, 0, -1)[1]) * (alt - t2AzAlt(1, 0, -1)[1]) > 0
        )
          continue;
      } else {
        if (
          (alt - t2AzAlt(0, 1)[1]) * (alt - t2AzAlt(1, 1)[1]) > 0 ||
          (alt - t2AzAlt(0, -1)[1]) * (alt - t2AzAlt(1, -1)[1]) > 0
        )
          continue;
      }
      const t = findRootBrent(0, 1, (t) => t2AzAlt(t)[1] - alt);
      if (t === null || t === 0) continue;
      const [xt, yt] = t2xy(t);
      const [x, y] = offsetLabel(xt, yt, pos, fontSize);
      const newD = {
        pos,
        kind: "alt",
        x,
        y,
        label: `${alt > 0 ? "+" : ""}${alt}°`,
        rotate: getRotateAngle(pos),
      } as GraticuleLabelDataType;
      avoidCollision(tree, newD, fontSize);
      res.push(newD);
    }
  }

  return res;
};

const GraticuleLabels = ({ proj }: { proj: d3.GeoProjection }) => (
  <g>
    {placeGraticuleLabels(proj, 10)?.map(
      ({ pos, kind, x, y, label, rotate }) => (
        <text
          key={`${
            pos.side + (pos.sub === null ? "" : `(${pos.sub})`)
          }-${kind}-${label}`}
          className="tw-fill-gray-900/80 tw-font-mono tw-text-[10px] tw-leading-normal"
          x={x}
          y={y}
          textAnchor="middle"
          transform={`rotate(${rotate},${x},${y})`}
        >
          {label}
        </text>
      ),
    )}
  </g>
);
