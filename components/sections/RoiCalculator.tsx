"use client";

import { useState } from "react";
import { PillButton } from "@/components/ui/pill-button";

function Slider({
  label,
  value,
  set,
  min,
  max,
  step = 1,
  suffix = "",
}: {
  label: string;
  value: number;
  set: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-[1.3rem] font-semibold uppercase text-[var(--ink)] max-md:text-sm">{label}</span>
        <span className="text-[2rem] font-bold text-[var(--teal)] max-md:text-lg">
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="mt-[0.8rem] w-full accent-[var(--teal)]"
      />
    </label>
  );
}

const fmt = (n: number) => `€${Math.round(n).toLocaleString()}`;

/** Simple ROI model: hours automated × hourly cost, plus revenue from faster lead response. */
export function RoiCalculator() {
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(8);
  const [rate, setRate] = useState(35);
  const [automatable, setAutomatable] = useState(60);
  const [leads, setLeads] = useState(100);
  const [dealValue, setDealValue] = useState(1500);

  const hoursSavedYear = people * hours * (automatable / 100) * 48;
  const labourSaving = hoursSavedYear * rate;
  // Conservative assumption: faster follow-up converts 2% more of monthly leads.
  const revenueLift = leads * 0.02 * dealValue * 12;
  const total = labourSaving + revenueLift;

  return (
    <section className="sec-green bg-white">
      <div className="container-x grid grid-cols-[1.2fr_1fr] gap-[3rem] max-lg:grid-cols-1">
        <div className="space-y-[2.4rem] rounded-[1.875rem] border-[0.8px] border-[var(--line)] p-[3rem] max-md:p-6">
          <Slider label="Team members doing manual work" value={people} set={setPeople} min={1} max={50} />
          <Slider label="Hours per person per week on repetitive tasks" value={hours} set={setHours} min={1} max={30} suffix="h" />
          <Slider label="Average hourly cost" value={rate} set={setRate} min={15} max={150} suffix=" €" />
          <Slider label="Share that could be automated" value={automatable} set={setAutomatable} min={10} max={90} step={5} suffix="%" />
          <Slider label="New leads per month" value={leads} set={setLeads} min={0} max={1000} step={10} />
          <Slider label="Average deal value" value={dealValue} set={setDealValue} min={100} max={20000} step={100} suffix=" €" />
        </div>

        <div className="flex flex-col justify-between rounded-[1.875rem] bg-[#040404] p-[3rem] text-white max-md:p-6">
          <div>
            <div className="text-[1.2rem] uppercase tracking-widest text-white/60">Estimated yearly value</div>
            <div className="mt-[0.6rem] text-[5rem] font-bold leading-none tracking-[-0.03em] text-[var(--accent)] max-md:text-5xl">{fmt(total)}</div>
            <div className="mt-[2.4rem] grid grid-cols-2 gap-[1.2rem]">
              <div className="rounded-[1.2rem] bg-white/5 p-[1.4rem]">
                <div className="text-[2.6rem] font-bold leading-none max-md:text-xl">{Math.round(hoursSavedYear).toLocaleString()}h</div>
                <div className="mt-[0.4rem] text-[1rem] uppercase text-white/60">hours saved / year</div>
              </div>
              <div className="rounded-[1.2rem] bg-white/5 p-[1.4rem]">
                <div className="text-[2.6rem] font-bold leading-none max-md:text-xl">{fmt(labourSaving)}</div>
                <div className="mt-[0.4rem] text-[1rem] uppercase text-white/60">labour cost saved</div>
              </div>
              <div className="col-span-2 rounded-[1.2rem] bg-white/5 p-[1.4rem]">
                <div className="text-[2.6rem] font-bold leading-none max-md:text-xl">{fmt(revenueLift)}</div>
                <div className="mt-[0.4rem] text-[1rem] uppercase text-white/60">extra revenue from faster lead response*</div>
              </div>
            </div>
            <p className="mt-[1.4rem] text-[1rem] leading-[1.5rem] text-white/50">
              *Assumes a conservative 2% uplift in conversion from instant follow-up and 48 working weeks a year. Estimates only — your audit gives real numbers.
            </p>
          </div>
          <div className="mt-[2rem]">
            <PillButton variant="white" href="/contact">
              Validate With A Free Audit
            </PillButton>
          </div>
        </div>
      </div>
    </section>
  );
}
