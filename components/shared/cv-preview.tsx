"use client";

import type { ParsedCv } from "@/lib/validations/cv";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export function CvPreview({ data }: { data: ParsedCv }) {
  const { contact, summary, experience, education, skills } = data;
  const hasContact =
    contact.name || contact.email || contact.phone || contact.location;

  return (
    <div className="space-y-5 text-sm">
      {hasContact && (
        <div className="text-center">
          {contact.name && (
            <h2 className="text-xl font-bold">{contact.name}</h2>
          )}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            {contact.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {contact.email}
              </span>
            )}
            {contact.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </span>
            )}
            {contact.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {contact.location}
              </span>
            )}
            {contact.linkedin && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {contact.linkedin}
              </span>
            )}
          </div>
        </div>
      )}

      {summary && (
        <>
          <Separator />
          <div>
            <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Summary
            </h3>
            <p className="text-muted-foreground">{summary}</p>
          </div>
        </>
      )}

      {experience.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Experience
            </h3>
            <div className="space-y-3">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{exp.role || "Role"}</p>
                      <p className="text-muted-foreground">
                        {exp.company || "Company"}
                      </p>
                    </div>
                    {(exp.startDate || exp.endDate) && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {exp.startDate}
                        {exp.endDate ? ` – ${exp.endDate}` : ""}
                      </span>
                    )}
                  </div>
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                      {exp.bullets.filter(Boolean).map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {education.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Education
            </h3>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{edu.degree || "Degree"}</p>
                    <p className="text-muted-foreground">
                      {edu.institution || "Institution"}
                    </p>
                  </div>
                  {edu.year && (
                    <span className="text-xs text-muted-foreground">
                      {edu.year}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {skills.filter(Boolean).length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {skills.filter(Boolean).map((skill, i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
