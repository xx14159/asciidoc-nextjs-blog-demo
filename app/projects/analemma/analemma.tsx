"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import clamp from "lodash/clamp";

import Button from "@/app/components/button";
import Form from "@/app/components/forms/form";
import InputGroup from "@/app/components/forms/input-group";
import Tooltip from "@/app/components/tooltip";
import TooltipWrapper from "@/app/components/tooltip/wrapper";
import SkyMap from "./sky-map";
import { calculateSunCoords } from "./utils";

const latDefault = 30;
const longDefault = 0;
const timeDefault = "08:00";

const Analemma = () => {
  const [wasm, setWasm] = useState<
    | typeof import("@/wasm/analemma-helpers/pkg/analemma_helpers")
    | null
    | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      try {
        setWasm(await import("@/wasm/analemma-helpers/pkg/analemma_helpers"));
      } catch (err) {
        setWasm(null);
        console.error(err);
      }
    })();
  }, []);

  const searchParams = useSearchParams();
  const latRaw = Number(searchParams.get("lat") || NaN);
  const longRaw = Number(searchParams.get("long") || NaN);
  const timeRaw = searchParams.get("time") ?? "";

  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const [lat, setLat] = useState(() =>
    Number.isFinite(latRaw) ? latRaw : latDefault,
  );
  const [long, setLong] = useState(() =>
    Number.isFinite(longRaw) ? longRaw : longDefault,
  );
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [time, setTime] = useState(() =>
    /^([01][0-9]|2[0-3]):([0-5][0-9])$/.test(timeRaw) ? timeRaw : timeDefault,
  );
  const [coords, setCoords] = useState<number[][] | null>(null);

  return (
    <>
      <Form className="tw-mb-8 tw-flex tw-flex-col tw-items-stretch tw-justify-stretch tw-gap-x-4 tw-gap-y-4 sm:tw-gap-x-6 lg:tw-flex-row lg:tw-items-start">
        <div className="tw-flex tw-flex-none tw-grow-[6] tw-items-start tw-justify-stretch tw-gap-x-4 sm:tw-gap-x-6">
          <InputGroup
            className="tw-w-36 tw-flex-none tw-grow"
            label="Latitude"
            inputProps={{
              type: "number",
              value: lat,
              onChange: (event) => setLat(Number(event.target.value)),
              onStep: (value) => setLat(value),
              min: -90.0,
              max: 90.0,
              step: Math.pow(
                10,
                -Math.min(lat.toString().split(".").at(1)?.length ?? 0, 2),
              ),
            }}
            errorMessage={
              lat < -90 || lat > 90
                ? "Latitude values should be between -90 and 90."
                : undefined
            }
          >
            <TooltipWrapper className="tw-ml-1 tw-inline-block">
              <Button
                className="font-icon tw-text-gray-500 hover:tw-text-gray-700 focus:tw-text-gray-700"
                kind="none"
                type="button"
                onClick={() => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setLat(+pos.coords.latitude.toFixed(2));
                    setLong(+pos.coords.longitude.toFixed(2));
                  });
                }}
              >
                {"\ue0c8"}
              </Button>
              <Tooltip position="top-left" caretPosition="8.75px">
                Get my location
              </Tooltip>
            </TooltipWrapper>
          </InputGroup>
          <InputGroup
            className="tw-w-36 tw-flex-none tw-grow"
            label="Longitude"
            inputProps={{
              type: "number",
              value: long,
              onChange: (event) => setLong(Number(event.target.value)),
              onStep: (value) => setLong(value),
              min: -180.0,
              max: 180.0,
              step: Math.pow(
                10,
                -Math.min(long.toString().split(".").at(1)?.length ?? 0, 2),
              ),
            }}
            errorMessage={
              long < -180 || long > 180
                ? "Longitude values should be between -180 and 180."
                : undefined
            }
          />
        </div>

        <div className="tw-flex tw-flex-none tw-grow tw-flex-col tw-items-stretch tw-justify-stretch tw-gap-x-4 tw-gap-y-4 sm:tw-flex-row sm:tw-items-start sm:tw-gap-x-6">
          <div className="tw-flex tw-flex-none tw-grow tw-items-start tw-justify-stretch tw-gap-x-4 sm:tw-gap-x-6">
            <InputGroup
              className="tw-w-36 tw-flex-none tw-grow"
              label="Year"
              inputProps={{
                type: "number",
                value: year,
                onChange: (event) => setYear(Number(event.target.value)),
                onStep: (value) => setYear(value),
                min: 1990,
                max: 2059,
                step: 1,
              }}
              errorMessage={
                year < 1990 || year >= 2060
                  ? "Currently only years within [1990, 2059] are supported."
                  : undefined
              }
            />
            <InputGroup
              className="tw-flex-none"
              label="Time (UTC)"
              inputProps={{
                className: "tw-tabular-nums",
                type: "time",
                value: time,
                onChange: (event) => setTime(event.target.value),
                step: 60,
              }}
            />
          </div>

          <Button
            className={`loading tw-mt-4 tw-flex-none tw-grow sm:tw--mb-px sm:tw-mt-7 sm:tw-grow-0 ${
              wasm == null ? "" : "loaded"
            }`}
            kind="ghost2solid"
            disabled={wasm == null}
            onClick={() => {
              if (wasm == null) return;
              const newLat = clamp(lat, -90, 90);
              const newLong = clamp(long, -180, 180);
              const newYear = clamp(Math.floor(year), 1990, 2059);
              setLat(newLat);
              setLong(newLong);
              setYear(newYear);
              setCoords(
                calculateSunCoords(newLat, newLong, newYear, time, wasm),
              );
            }}
          >
            Calculate
          </Button>
        </div>
      </Form>

      {coords === null ? (
        <div className="tw-aspect-[8/5] tw-border-2 tw-border-dashed tw-border-gray-300 tw-bg-gray-50"></div>
      ) : (
        <SkyMap data={coords} />
      )}
    </>
  );
};

export default Analemma;

export const AnalemmaFallback = () => (
  <>
    <Form className="tw-mb-8 tw-flex tw-flex-col tw-items-stretch tw-justify-stretch tw-gap-x-4 tw-gap-y-4 sm:tw-gap-x-6 lg:tw-flex-row lg:tw-items-start">
      <div className="tw-flex tw-flex-none tw-grow-[6] tw-items-start tw-justify-stretch tw-gap-x-4 sm:tw-gap-x-6">
        <InputGroup
          className="tw-w-36 tw-flex-none tw-grow"
          label="Latitude"
          inputWrapperProps={{ className: "tw-animate-pulse" }}
          inputProps={{
            type: "number",
            value: latDefault,
            disabled: true,
          }}
        >
          <TooltipWrapper className="tw-ml-1 tw-inline-block">
            <Button
              className="font-icon tw-animate-pulse tw-text-gray-500"
              kind="none"
              type="button"
              disabled={true}
            >
              {"\ue0c8"}
            </Button>
            <Tooltip position="top-left" caretPosition="8.75px">
              Get my location
            </Tooltip>
          </TooltipWrapper>
        </InputGroup>
        <InputGroup
          className="tw-w-36 tw-flex-none tw-grow"
          label="Longitude"
          inputWrapperProps={{ className: "tw-animate-pulse" }}
          inputProps={{
            type: "number",
            value: longDefault,
            disabled: true,
          }}
        />
      </div>

      <div className="tw-flex tw-flex-none tw-grow tw-flex-col tw-items-stretch tw-justify-stretch tw-gap-x-4 tw-gap-y-4 sm:tw-flex-row sm:tw-items-start sm:tw-gap-x-6">
        <div className="tw-flex tw-flex-none tw-grow tw-items-start tw-justify-stretch tw-gap-x-4 sm:tw-gap-6">
          <InputGroup
            className="tw-w-36 tw-flex-none tw-grow"
            label="Year"
            inputWrapperProps={{ className: "tw-animate-pulse" }}
            inputProps={{
              type: "number",
              value: new Date().getFullYear(),
              disabled: true,
            }}
          />
          <InputGroup
            className="tw-flex-none"
            label="Time (UTC)"
            inputWrapperProps={{
              className: "tw-animate-pulse",
            }}
            inputProps={{
              className: "tw-tabular-nums",
              type: "time",
              value: timeDefault,
              disabled: true,
            }}
          />
        </div>

        <Button
          className="loading tw-mt-4 tw-flex-none tw-grow sm:tw--mb-px sm:tw-mt-7 sm:tw-grow-0"
          kind="ghost2solid"
          disabled={true}
        >
          Calculate
        </Button>
      </div>
    </Form>

    <div className="tw-aspect-[8/5] tw-border-2 tw-border-dashed tw-border-gray-300 tw-bg-gray-50"></div>
  </>
);
