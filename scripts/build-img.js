const fs = require("fs");
const path = require("path");

const sharp = require("sharp");

const SM_BREAK_POINTS = [120, 240, 360, 480, 720, 1080];
const LG_BREAK_POINTS = [720, 1080, 1440, 1920, 2560, 3840];
const LG_SIZE = 1440;
const THUMBNAIL_SIZE = SM_BREAK_POINTS[0] / 2;

const files = process.argv.slice(2);

const splitFilename = (filename) => ({
  dirname: path.dirname(filename),
  basenameWithoutExt: path.basename(filename, path.extname(filename)),
});

const getInfoPath = (dirname, basenameWithoutExt) =>
  path.join(process.cwd(), "../_img", dirname, `${basenameWithoutExt}.json`);

const getSavePath = (
  dirname,
  basenameWithoutExt,
  newWidth,
  useWidthInFilename,
) =>
  path.join(
    process.cwd(),
    "../public",
    dirname,
    `${basenameWithoutExt}${useWidthInFilename ? `-${newWidth}w` : ""}.webp`,
  );

const processFile = (filename, mtime) => {
  const { dirname, basenameWithoutExt } = splitFilename(filename);

  fs.readFile(filename, null, (err, data) => {
    if (err) throw err;

    sharp(data, { animated: true })
      .metadata()
      .then((metadata) => {
        const width = metadata.width;
        const height = metadata.pageHeight ?? metadata.height;

        const webpConfig = {
          quality: 90,
          smartSubsample: true,
          effort: 6,
          loop:
            metadata.loop != null &&
            metadata.loop >= 0 &&
            metadata.loop <= 65535
              ? metadata.loop
              : 0,
          delay: metadata.delay,
        };

        const saveInfo = (isThumbnail) => {
          const infoPath = getInfoPath(dirname, basenameWithoutExt);

          fs.mkdir(path.dirname(infoPath), { recursive: true }, (err) => {
            if (err) throw err;

            (isThumbnail
              ? sharp(data)
                  .resize(
                    Math.min(width / 2, THUMBNAIL_SIZE),
                    Math.min(height / 2, THUMBNAIL_SIZE),
                    {
                      fit: "inside",
                    },
                  )
                  .webp({
                    quality: 60,
                    smartSubsample: true,
                    reductionEffort: 6,
                  })
              : sharp(data, { animated: true }).webp(webpConfig)
            )
              .toBuffer()
              .then((buffer) => {
                fs.writeFile(
                  infoPath,
                  JSON.stringify({
                    data: `data:image/webp;base64,${buffer.toString("base64")}`,
                    originalWidth: width,
                    originalHeight: height,
                    mtime: mtime,
                  }),
                  (err) => {
                    if (err) throw err;
                  },
                );
              });
          });
        };

        const resizeAndSaveFile = (newWidth, useWidthInFilename) => {
          const savePath = getSavePath(
            dirname,
            basenameWithoutExt,
            newWidth,
            useWidthInFilename,
          );

          fs.mkdir(path.dirname(savePath), { recursive: true }, (err) => {
            if (err) throw err;

            sharp(data, { animated: true })
              .resize(newWidth, null, {
                fastShrinkOnLoad: false,
              })
              .webp(webpConfig)
              .toBuffer()
              .then((buffer) => {
                fs.writeFile(savePath, buffer, (err) => {
                  if (err) throw err;
                });
              });
          });
        };

        const allResizeAndSaveFile = (breakPoints) => {
          breakPoints.forEach((breakPoint) => {
            if (width >= breakPoint) {
              resizeAndSaveFile(breakPoint, true);
            }
          });
        };

        if (width <= THUMBNAIL_SIZE && height <= THUMBNAIL_SIZE) {
          // xxs img
          saveInfo(false);
        } else if (width < SM_BREAK_POINTS[0]) {
          // xs img
          saveInfo(true);
          resizeAndSaveFile(width, false);
        } else if (
          basenameWithoutExt.endsWith("-sm") ||
          basenameWithoutExt.endsWith(".sm") ||
          width < LG_SIZE
        ) {
          // sm img
          saveInfo(true);
          allResizeAndSaveFile(SM_BREAK_POINTS);
        } else {
          // lg img
          saveInfo(true);
          allResizeAndSaveFile(LG_BREAK_POINTS);
        }
      });
  });
};

files.forEach((filename) => {
  const { dirname, basenameWithoutExt } = splitFilename(filename);

  const infoPath = getInfoPath(dirname, basenameWithoutExt);

  if (fs.existsSync(infoPath)) {
    fs.readFile(infoPath, (err, data) => {
      if (err) throw err;

      fs.stat(filename, (err, stats) => {
        if (err) throw err;

        if (
          stats.mtime.toISOString() !== JSON.parse(data.toString("utf8")).mtime
        ) {
          console.log(`modified: ${filename}`);
          processFile(filename, stats.mtime.toISOString());
        }
      });
    });
  } else {
    fs.stat(filename, (err, stats) => {
      if (err) throw err;

      console.log(`new: ${filename}`);
      processFile(filename, stats.mtime.toISOString());
    });
  }
});

const fileListPath = path.join(process.cwd(), "../_img/.fileList.json");

if (fs.existsSync(fileListPath)) {
  fs.readFile(fileListPath, (err, data) => {
    if (err) throw err;

    const oldFileList = JSON.parse(data.toString("utf8"));

    oldFileList.forEach((filename) => {
      if (files.indexOf(filename) === -1) {
        console.log(`removed: ${filename}`);

        const { dirname, basenameWithoutExt } = splitFilename(filename);

        const infoPath = getInfoPath(dirname, basenameWithoutExt);
        if (fs.existsSync(infoPath)) {
          fs.unlink(infoPath, (err) => {
            if (err) throw err;
          });
        }

        [...new Set([0].concat(SM_BREAK_POINTS, LG_BREAK_POINTS))].forEach(
          (breakPoint) => {
            const savePath = getSavePath(
              dirname,
              basenameWithoutExt,
              breakPoint,
              breakPoint !== 0,
            );
            if (fs.existsSync(savePath)) {
              fs.unlink(savePath, (err) => {
                if (err) throw err;
              });
            }
          },
        );
      }
    });
  });
}

fs.mkdir(path.dirname(fileListPath), { recursive: true }, (err) => {
  if (err) throw err;

  fs.writeFile(fileListPath, JSON.stringify(files), (err) => {
    if (err) throw err;
  });
});
