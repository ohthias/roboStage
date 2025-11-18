"use client";
import React from "react";
import { Bot } from "lucide-react";
import { StrategyBoard } from "@/components/QuickBrick/SWOT-template/StrategyBoard";
import { TeamInfo } from "@/components/QuickBrick/SWOT-template/TeamInfo";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function SWOTPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4">
        <Breadcrumbs />
        <div className="mx-auto mt-6 ">
          <div role="tablist" className="tabs tabs-border">
            <input
              type="radio"
              name="fll-tabs"
              role="tab"
              className="tab"
              aria-label="Quadro Estratégico"
              defaultChecked
            />
            <div
              role="tabpanel"
              className="tab-content p-6"
            >
              <StrategyBoard />
            </div>

            <input
              type="radio"
              name="fll-tabs"
              role="tab"
              className="tab"
              aria-label="Info do Time"
            />
            <div
              role="tabpanel"
              className="tab-content p-6"
            >
              <TeamInfo />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
