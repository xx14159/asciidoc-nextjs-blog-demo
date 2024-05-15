import fs from "fs";
import path from "path";

import { imgPrefix } from "@/app/lib/server/env";

const imgDirectory = path.join(process.cwd(), "_img");

const SM_BREAK_POINTS = [120, 240, 360, 480, 720, 1080];
const LG_BREAK_POINTS = [720, 1080, 1440, 1920, 2560, 3840];
const LG_SIZE = 1440;
const THUMBNAIL_SIZE = SM_BREAK_POINTS[0] / 2;

const getLocalImage = (filename: string) => {
  const dirname = path.dirname(filename);
  const basenameWithoutExt = path.basename(filename, path.extname(filename));
  const infoPath = path.join(
    imgDirectory,
    dirname,
    `${basenameWithoutExt}.json`,
  );

  try {
    const data = fs.readFileSync(infoPath, { encoding: "utf-8" });
    const info = JSON.parse(data);
    const width = info.originalWidth;
    const height = info.originalHeight;

    const getSrcset = (
      responsiveWidths: number[],
      useWidthInFilename: boolean,
    ) =>
      responsiveWidths
        .map(
          (responsiveWidth) =>
            new URL(
              `${dirname}/${basenameWithoutExt}${
                useWidthInFilename ? `-${responsiveWidth}w` : ""
              }.webp`,
              imgPrefix,
            ).href + ` ${responsiveWidth}w`,
        )
        .join(",");

    const getOG = (responsiveWidths: number[], useWidthInFilename: boolean) => {
      const candidateWidths = responsiveWidths.filter(
        (responsiveWidth) =>
          responsiveWidth >= 1200 && (responsiveWidth / width) * height >= 630,
      );
      const candidateWidth =
        candidateWidths.length > 0
          ? candidateWidths[0]
          : responsiveWidths[responsiveWidths.length - 1];

      return new URL(
        `${dirname}/${basenameWithoutExt}${
          useWidthInFilename ? `-${candidateWidth}w` : ""
        }.webp`,
        imgPrefix,
      ).href;
    };

    if (width <= THUMBNAIL_SIZE && height <= THUMBNAIL_SIZE) {
      // xxs img
      return { data: info.data, srcset: null, og: info.data };
    } else if (width < SM_BREAK_POINTS[0]) {
      // xs img
      return {
        data: info.data,
        srcset: getSrcset([width], false),
        og: getOG([width], false),
      };
    } else if (
      basenameWithoutExt.endsWith("-sm") ||
      basenameWithoutExt.endsWith(".sm") ||
      width < LG_SIZE
    ) {
      // sm img
      return {
        data: info.data,
        srcset: getSrcset(
          SM_BREAK_POINTS.filter((breakPoint) => width >= breakPoint),
          true,
        ),
        og: getOG(
          SM_BREAK_POINTS.filter((breakPoint) => width >= breakPoint),
          true,
        ),
      };
    } else {
      //lg img
      return {
        data: info.data,
        srcset: getSrcset(
          LG_BREAK_POINTS.filter((breakPoint) => width >= breakPoint),
          true,
        ),
        og: getOG(
          LG_BREAK_POINTS.filter((breakPoint) => width >= breakPoint),
          true,
        ),
      };
    }
  } catch {
    return { data: filename, srcset: null, og: filename, failed: true };
  }
};

export default getLocalImage;
