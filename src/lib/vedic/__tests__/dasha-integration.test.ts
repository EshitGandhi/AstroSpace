import { describe, it, expect } from "vitest";
import { calculateKundli } from "../calculate.server";
import {
  assertDashaSummaryMatchesTimeline,
  assertDashaTimelineIntegrity,
  assertDashaTimelineSerializable,
} from "./dasha-assertions";

const REFERENCE_CHARTS = [
  {
    label: "Delhi — 15 May 1990, 10:30 IST",
    input: {
      date: "1990-05-15",
      time: "10:30",
      lat: 28.6139,
      lng: 77.209,
      timezone: "Asia/Kolkata",
    },
  },
  {
    label: "Mumbai — 20 Aug 1985, 06:15 IST",
    input: {
      date: "1985-08-20",
      time: "06:15",
      lat: 19.076,
      lng: 72.8777,
      timezone: "Asia/Kolkata",
    },
  },
  {
    label: "Chennai — 1 Jan 2000, 00:30 IST",
    input: {
      date: "2000-01-01",
      time: "00:30",
      lat: 13.0827,
      lng: 80.2707,
      timezone: "Asia/Kolkata",
    },
  },
] as const;

describe("dasha timeline integration", () => {
  it.each(REFERENCE_CHARTS)("returns a valid timeline for $label", ({ input }) => {
    const result = calculateKundli(input);

    expect(result.dashaTimeline).toBeDefined();
    assertDashaTimelineIntegrity(result.dashaTimeline);
    assertDashaSummaryMatchesTimeline(result);
    assertDashaTimelineSerializable(result.dashaTimeline);
  });

  it("includes dashaTimeline in JSON API-shaped payload", () => {
    const result = calculateKundli({
      date: "1990-05-15",
      time: "10:30",
      lat: 28.6139,
      lng: 77.209,
      timezone: "Asia/Kolkata",
      name: "Test User",
    });

    const apiPayload = JSON.parse(JSON.stringify(result)) as typeof result;

    expect(apiPayload.dashaTimeline.birthNakshatra).toBe(result.dashaTimeline.birthNakshatra);
    expect(apiPayload.dashaTimeline.mahadashas).toHaveLength(9);
    expect(apiPayload.name).toBe("Test User");
  });
});
