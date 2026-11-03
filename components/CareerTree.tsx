"use client";

import { useState, type ReactNode } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import {
  Accordion,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import InlineMention from "@/components/InlineMention";
import { JetBrains_Mono } from "next/font/google";

const terminalFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

function Branch({
  name,
  detail,
  children,
  expanded,
  onToggle,
}: {
  name: string;
  detail?: string;
  children: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = expanded ?? localOpen;
  const Icon = open ? FolderOpen : Folder;
  return (
    <Accordion
      bounce="mobile"
      as="li"
      className="career-tree-branch"
      open={open}
      onOpenChange={() => (onToggle ? onToggle() : setLocalOpen(!localOpen))}
    >
      <AccordionTrigger className="career-tree-folder">
        <ChevronRight
          className="career-tree-chevron"
          size={14}
          aria-hidden="true"
        />
        <Icon
          size={18}
          className="career-tree-folder-icon"
          aria-hidden="true"
        />
        <span>
          {name}
          {detail && <small>{detail}</small>}
        </span>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </Accordion>
  );
}

export default function CareerTree() {
  const [openRole, setOpenRole] = useState<string | null>(null);
  const [openCompanies, setOpenCompanies] = useState<
    Record<string, string | null>
  >({});
  const [openSections, setOpenSections] = useState<
    Record<string, string | null>
  >({});

  return (
    <div
      className={`career-tree ${terminalFont.className}`}
      aria-label="Explore my jobs before tech"
    >
      <div className="career-tree-root">
        <FolderOpen size={20} aria-hidden="true" />
        <span>before-tech</span>
      </div>
      <ul className="career-tree-roles">
        {[
          { role: "Warehouse Associate", companies: ["Square Deal", "UPS"] },
          { role: "Sales Rep", companies: ["Telus"] },
          {
            role: "H.I.S Implementation Specialist",
            companies: ["Trillium Health Partners"],
          },
        ].map(({ role, companies }) => (
          <Branch
            key={role}
            name={role.toLowerCase().replaceAll(" ", "-")}
            expanded={openRole === role}
            onToggle={() =>
              setOpenRole((current) => (current === role ? null : role))
            }
          >
            <ul className="career-tree-children">
              {companies.map((company) => (
                <Branch
                  key={company}
                  name={company}
                  expanded={openCompanies[role] === company}
                  onToggle={() =>
                    setOpenCompanies((current) => ({
                      ...current,
                      [role]: current[role] === company ? null : company,
                    }))
                  }
                >
                  <ul className="career-tree-children">
                    <Branch
                      name="lessons-learnt"
                      expanded={
                        openSections[`${role}/${company}`] === "lessons-learnt"
                      }
                      onToggle={() =>
                        setOpenSections((current) => ({
                          ...current,
                          [`${role}/${company}`]:
                            current[`${role}/${company}`] === "lessons-learnt"
                              ? null
                              : "lessons-learnt",
                        }))
                      }
                    >
                      <div className="career-tree-empty">
                        {company === "Trillium Health Partners" ? (
                          <ul className="career-tree-lessons">
                            <li>
                              12-hour shifts aren’t for the weak — worked 6am to
                              6pm, or the overnight shift from 6pm to 6am
                            </li>
                            <li>
                              learned firsthand how fast-paced hospitals are
                              behind the scenes
                            </li>
                          </ul>
                        ) : company === "Telus" ? (
                          <ul className="career-tree-lessons">
                            <li>
                              being good at sales goes a long way, even outside
                              a sales job
                            </li>
                            <li>
                              knowing your product inside out matters, but so
                              does listening and understanding what someone
                              actually needs
                            </li>
                          </ul>
                        ) : (
                          <ul className="career-tree-lessons">
                            <li>physical work is tough</li>
                          </ul>
                        )}
                      </div>
                    </Branch>
                    <Branch
                      name="what-i-did"
                      expanded={
                        openSections[`${role}/${company}`] === "what-i-did"
                      }
                      onToggle={() =>
                        setOpenSections((current) => ({
                          ...current,
                          [`${role}/${company}`]:
                            current[`${role}/${company}`] === "what-i-did"
                              ? null
                              : "what-i-did",
                        }))
                      }
                    >
                      <div className="career-tree-empty">
                        {company === "Trillium Health Partners" ? (
                          <ul className="career-tree-lessons">
                            <li>
                              helped doctors, surgeons, and nurses use{" "}
                              <InlineMention
                                name="epic"
                                colors={["#b6263c", "#dc5945"]}
                                description="An electronic health record platform hospitals use to manage patient records and coordinate day-to-day care."
                              />{" "}
                              in their day-to-day work
                            </li>
                          </ul>
                        ) : company === "Telus" ? (
                          <ul className="career-tree-lessons">
                            <li>
                              helped new and existing customers choose telus and
                              koodo phones and plans, in-store and over the
                              phone
                            </li>
                          </ul>
                        ) : (
                          <ul className="career-tree-lessons">
                            <li>
                              {company === "UPS"
                                ? "sorted and moved packages to keep shipments on schedule"
                                : "picked, packed, and prepared orders for shipping"}
                            </li>
                            {company === "Square Deal" && (
                              <li>
                                creating and wrapping cardboard boxes for
                                shipping
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </Branch>
                  </ul>
                </Branch>
              ))}
            </ul>
          </Branch>
        ))}
      </ul>
    </div>
  );
}
