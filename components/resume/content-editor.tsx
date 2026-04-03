"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import type { ResumeContent, SectionKey } from "@/lib/resume/types";
import { DEFAULT_CONTENT } from "@/lib/resume/defaults";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Plus,
  Trash2,
  X,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  FolderOpen,
  Heart,
  BookOpen,
  Target,
  AlignLeft,
} from "lucide-react";

interface ContentEditorProps {
  cvId: string;
  initialData: ResumeContent;
  onChange: (data: ResumeContent) => void;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved") => void;
}

const SECTION_META: Record<string, { label: string; icon: React.ElementType; emptyMsg: string }> = {
  contact: { label: "Contact", icon: User, emptyMsg: "" },
  targetTitle: { label: "Target Title", icon: Target, emptyMsg: "" },
  summary: { label: "Summary", icon: AlignLeft, emptyMsg: "" },
  experience: { label: "Work Experience", icon: Briefcase, emptyMsg: "No work experience added yet" },
  education: { label: "Education", icon: GraduationCap, emptyMsg: "No education added yet" },
  skills: { label: "Skills", icon: Wrench, emptyMsg: "Add skills to showcase your expertise" },
  certifications: { label: "Certifications", icon: Award, emptyMsg: "No certifications added yet" },
  awards: { label: "Awards", icon: Award, emptyMsg: "Add awards to stand out" },
  projects: { label: "Projects", icon: FolderOpen, emptyMsg: "No projects added yet" },
  volunteering: { label: "Volunteering", icon: Heart, emptyMsg: "No volunteering added yet" },
  publications: { label: "Publications", icon: BookOpen, emptyMsg: "No publications added yet" },
};

const SECTION_ORDER: SectionKey[] = [
  "contact", "targetTitle", "summary", "experience", "education",
  "skills", "certifications", "awards", "projects", "volunteering", "publications",
];

export function ContentEditor({ cvId, initialData, onChange, onSaveStatusChange }: ContentEditorProps) {
  const { register, control, getValues, setValue } = useForm<ResumeContent>({
    defaultValues: initialData,
  });

  const watched = useWatch({ control });
  const debounceRef = useRef<NodeJS.Timeout>();
  const lastSavedJsonRef = useRef<string>(JSON.stringify(initialData));
  const lastPreviewJsonRef = useRef<string>(JSON.stringify(initialData));
  const dirtyRef = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSaveRef = useRef(onSaveStatusChange);
  onSaveRef.current = onSaveStatusChange;

  const save = useCallback(
    async (data: ResumeContent) => {
      const json = JSON.stringify(data);
      if (json === lastSavedJsonRef.current) return;
      lastSavedJsonRef.current = json;
      dirtyRef.current = false;
      onSaveRef.current?.("saving");
      await fetch("/api/cv/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvId, parsed_json: data }),
      });
      onSaveRef.current?.("saved");
    },
    [cvId]
  );

  useEffect(() => {
    const data = getValues();
    const json = JSON.stringify(data);
    if (json !== lastPreviewJsonRef.current) {
      lastPreviewJsonRef.current = json;
      onChangeRef.current(data);
    }
    dirtyRef.current = true;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (dirtyRef.current) save(getValues());
    }, 5000);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched, save, getValues]);

  const handleBlur = useCallback(() => {
    if (!dirtyRef.current) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (dirtyRef.current) save(getValues());
    }, 1500);
  }, [save, getValues]);

  useEffect(() => {
    function onBeforeUnload() {
      if (!dirtyRef.current) return;
      const body = JSON.stringify({ cv_id: cvId, parsed_json: getValues() });
      navigator.sendBeacon("/api/cv/save", new Blob([body], { type: "application/json" }));
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [cvId, getValues]);

  function toggleSection(key: SectionKey) {
    const current = getValues(`sections.${key}` as `sections.contact`);
    setValue(`sections.${key}` as `sections.contact`, !current);
  }

  return (
    <div className="space-y-3" onBlur={handleBlur}>
      {SECTION_ORDER.map((key) => {
        const meta = SECTION_META[key];
        const Icon = meta.icon;
        const enabled = watched.sections?.[key] ?? DEFAULT_CONTENT.sections[key];

        return (
          <Collapsible key={key} defaultOpen={enabled} className="rounded-lg border">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => toggleSection(key)}
                className={`ml-3 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                  enabled
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/40"
                }`}
              >
                {enabled && (
                  <svg viewBox="0 0 12 12" fill="none" className="h-3 w-3 text-primary-foreground">
                    <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <CollapsibleTrigger className="flex flex-1 items-center justify-between px-3 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors">
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {meta.label}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
            </div>
            {enabled && (
              <CollapsibleContent className="border-t px-4 pb-4 pt-3">
                {key === "contact" && <ContactFields register={register} />}
                {key === "targetTitle" && <TargetTitleField register={register} />}
                {key === "summary" && <SummaryField register={register} />}
                {key === "experience" && <ExperienceFields control={control} register={register} />}
                {key === "education" && <EducationFields control={control} register={register} />}
                {key === "skills" && <SkillsFields control={control} getValues={getValues} setValue={setValue} />}
                {key === "certifications" && <CertificationFields control={control} register={register} />}
                {key === "awards" && <AwardFields control={control} register={register} />}
                {key === "projects" && <ProjectFields control={control} register={register} />}
                {key === "volunteering" && <VolunteeringFields control={control} register={register} />}
                {key === "publications" && <PublicationFields control={control} register={register} />}
              </CollapsibleContent>
            )}
          </Collapsible>
        );
      })}
    </div>
  );
}

// --- Section field components ---

function ContactFields({ register }: { register: any }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <Label className="text-xs">Full Name</Label>
        <Input {...register("contact.name")} placeholder="John Doe" />
      </div>
      <div>
        <Label className="text-xs">Email</Label>
        <Input {...register("contact.email")} placeholder="john@example.com" />
      </div>
      <div>
        <Label className="text-xs">Phone</Label>
        <Input {...register("contact.phone")} placeholder="+1 234 567 890" />
      </div>
      <div>
        <Label className="text-xs">Location</Label>
        <Input {...register("contact.location")} placeholder="New York, NY" />
      </div>
      <div>
        <Label className="text-xs">LinkedIn</Label>
        <Input {...register("contact.linkedin")} placeholder="linkedin.com/in/..." />
      </div>
      <div className="col-span-2">
        <Label className="text-xs">Website</Label>
        <Input {...register("contact.website")} placeholder="yoursite.com" />
      </div>
    </div>
  );
}

function TargetTitleField({ register }: { register: any }) {
  return (
    <div>
      <Label className="text-xs">Target Job Title</Label>
      <Input {...register("targetTitle.title")} placeholder="Senior Software Engineer" />
    </div>
  );
}

function SummaryField({ register }: { register: any }) {
  return <Textarea {...register("summary.content")} rows={4} placeholder="Professional summary..." />;
}

function DateField({ control, name, label }: { control: any; name: string; label: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            type="month"
            value={field.value && field.value !== "Present" ? field.value : ""}
            onChange={(e) => field.onChange(e.target.value)}
            className="block"
          />
        )}
      />
    </div>
  );
}

function DateRangeWithPresent({
  control,
  startName,
  endName,
  currentName,
  startLabel = "Start",
  endLabel = "End",
}: {
  control: any;
  startName: string;
  endName: string;
  currentName?: string;
  startLabel?: string;
  endLabel?: string;
}) {
  return (
    <Controller
      control={control}
      name={currentName || endName}
      render={({ field: currentField }) => {
        const isCurrent = currentName
          ? currentField.value === true
          : currentField.value === "Present";

        return (
          <>
            <DateField control={control} name={startName} label={startLabel} />
            <div>
              <Label className="text-xs">{endLabel}</Label>
              {isCurrent ? (
                <Input value="Present" disabled className="block" />
              ) : (
                <Controller
                  control={control}
                  name={endName}
                  render={({ field }) => (
                    <Input
                      type="month"
                      value={field.value && field.value !== "Present" ? field.value : ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="block"
                    />
                  )}
                />
              )}
            </div>
            {currentName && (
              <label className="flex items-center gap-2 text-sm col-span-2">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => {
                    currentField.onChange(e.target.checked);
                    if (e.target.checked) {
                      const { setValue } = control._formState ? control : { setValue: () => {} };
                      if (control._fields?.[endName]) {
                        control._subjects?.values?.next?.({});
                      }
                    }
                  }}
                  className="rounded"
                />
                Present
              </label>
            )}
          </>
        );
      }}
    />
  );
}

function EmptyState({ message, onAdd, buttonText }: { message: string; onAdd: () => void; buttonText: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        {buttonText}
      </Button>
    </div>
  );
}

function ExperienceFields({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "experience.items" });

  if (fields.length === 0) {
    return (
      <EmptyState
        message="No work experience added yet"
        onAdd={() => append({ company: "", role: "", location: "", startDate: "", endDate: "", isCurrent: false, bullets: [""] })}
        buttonText="Add Experience"
      />
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field, i) => (
        <ExpItem key={field.id} index={i} control={control} register={register} onRemove={() => remove(i)} />
      ))}
      <Button
        type="button" variant="outline" size="sm"
        onClick={() => append({ company: "", role: "", location: "", startDate: "", endDate: "", isCurrent: false, bullets: [""] })}
      >
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Experience
      </Button>
    </div>
  );
}

function ExpItem({ index, control, register, onRemove }: { index: number; control: any; register: any; onRemove: () => void }) {
  const { fields: bulletFields, append, remove } = useFieldArray({ control, name: `experience.items.${index}.bullets` as any });

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-start justify-between">
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Input {...register(`experience.items.${index}.company`)} placeholder="Company" />
          <Input {...register(`experience.items.${index}.role`)} placeholder="Role" />
          <Input {...register(`experience.items.${index}.location`)} placeholder="Location" className="col-span-2" />
          <DateRangeWithPresent
            control={control}
            startName={`experience.items.${index}.startDate`}
            endName={`experience.items.${index}.endDate`}
            currentName={`experience.items.${index}.isCurrent`}
          />
        </div>
        <Button type="button" variant="ghost" size="icon" className="ml-2 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Bullet Points</Label>
        {bulletFields.map((bf, bi) => (
          <div key={bf.id} className="flex gap-2">
            <Textarea {...register(`experience.items.${index}.bullets.${bi}`)} placeholder="Describe achievement..." rows={3} className="flex-1 resize-y" />
            <Button type="button" variant="ghost" size="icon" className="mt-1 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(bi)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={() => append("" as any)}>
          <Plus className="mr-1 h-3 w-3" /> Add Bullet
        </Button>
      </div>
    </div>
  );
}

function EducationFields({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "education.items" });

  if (fields.length === 0) {
    return (
      <EmptyState message="No education added yet" onAdd={() => append({ institution: "", degree: "", field: "", startDate: "", endDate: "" })} buttonText="Add Education" />
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Input {...register(`education.items.${i}.institution`)} placeholder="University" />
            <Input {...register(`education.items.${i}.degree`)} placeholder="Degree" />
            <Input {...register(`education.items.${i}.field`)} placeholder="Field of Study" className="col-span-2" />
            <DateField control={control} name={`education.items.${i}.startDate`} label="Start" />
            <DateField control={control} name={`education.items.${i}.endDate`} label="End" />
          </div>
          <Button type="button" variant="ghost" size="icon" className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ institution: "", degree: "", field: "", startDate: "", endDate: "" })}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Education
      </Button>
    </div>
  );
}

function SkillsFields({ control, getValues, setValue }: { control: any; getValues: any; setValue: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "skills.categories" });
  const [newSkill, setNewSkill] = useState<Record<number | string, string>>({});

  function addSkill(catIndex: number) {
    const val = (newSkill[catIndex] || "").trim();
    if (!val) return;
    const current: string[] = getValues(`skills.categories.${catIndex}.skills`) || [];
    setValue(`skills.categories.${catIndex}.skills`, [...current, val]);
    setNewSkill((prev) => ({ ...prev, [catIndex]: "" }));
  }

  function removeSkill(catIndex: number, skillIndex: number) {
    const current: string[] = getValues(`skills.categories.${catIndex}.skills`) || [];
    setValue(`skills.categories.${catIndex}.skills`, current.filter((_, i) => i !== skillIndex));
  }

  function addQuickSkill() {
    const val = (newSkill["quick"] || "").trim();
    if (!val) return;
    const cats = getValues("skills.categories") || [];
    const uncatIndex = cats.findIndex((c: { name: string }) => c.name === "" || c.name === "General");
    if (uncatIndex >= 0) {
      const current: string[] = getValues(`skills.categories.${uncatIndex}.skills`) || [];
      setValue(`skills.categories.${uncatIndex}.skills`, [...current, val]);
    } else {
      append({ name: "", skills: [val] });
    }
    setNewSkill((prev) => ({ ...prev, quick: "" }));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick add (no category)</Label>
        <div className="flex gap-2">
          <Input
            value={newSkill["quick"] || ""}
            onChange={(e) => setNewSkill((prev) => ({ ...prev, quick: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addQuickSkill(); } }}
            placeholder="Type skill + Enter"
            className="flex-1"
          />
        </div>
      </div>

      {fields.map((field, ci) => (
        <div key={field.id} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name={`skills.categories.${ci}.name`}
              render={({ field: f }) => <Input {...f} placeholder="Category name (optional)" className="flex-1" />}
            />
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(ci)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Controller
            control={control}
            name={`skills.categories.${ci}.skills`}
            render={({ field: f }) => (
              <div className="flex flex-wrap gap-1.5">
                {(f.value as string[] || []).map((skill: string, si: number) => (
                  <span key={si} className="flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-0.5 text-sm">
                    {skill}
                    <button type="button" onClick={() => removeSkill(ci, si)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          />
          <div className="flex gap-2">
            <Input
              value={newSkill[ci] || ""}
              onChange={(e) => setNewSkill((prev) => ({ ...prev, [ci]: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(ci); } }}
              placeholder="Type skill + Enter"
              className="flex-1"
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", skills: [] })}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Category
      </Button>
    </div>
  );
}

function CertificationFields({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "certifications.items" });

  if (fields.length === 0) {
    return <EmptyState message="No certifications added yet" onAdd={() => append({ name: "", issuer: "", startDate: "", endDate: "", isCurrent: false })} buttonText="Add Certification" />;
  }

  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Input {...register(`certifications.items.${i}.name`)} placeholder="Certification Name" />
            <Input {...register(`certifications.items.${i}.issuer`)} placeholder="Issuing Organization" />
            <DateRangeWithPresent
              control={control}
              startName={`certifications.items.${i}.startDate`}
              endName={`certifications.items.${i}.endDate`}
              currentName={`certifications.items.${i}.isCurrent`}
              startLabel="Issue Date"
              endLabel="Expiry Date"
            />
          </div>
          <Button type="button" variant="ghost" size="icon" className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", issuer: "", startDate: "", endDate: "", isCurrent: false })}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Certification
      </Button>
    </div>
  );
}

function AwardFields({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "awards.items" });

  if (fields.length === 0) {
    return <EmptyState message="Add awards to stand out" onAdd={() => append({ title: "", issuer: "", date: "", description: "" })} buttonText="Add Award" />;
  }

  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Input {...register(`awards.items.${i}.title`)} placeholder="Award Title" />
            <Input {...register(`awards.items.${i}.issuer`)} placeholder="Issuer" />
            <DateField control={control} name={`awards.items.${i}.date`} label="Date" />
            <Input {...register(`awards.items.${i}.description`)} placeholder="Description" className="col-span-2" />
          </div>
          <Button type="button" variant="ghost" size="icon" className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ title: "", issuer: "", date: "", description: "" })}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Award
      </Button>
    </div>
  );
}

function ProjectFields({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "projects.items" });

  if (fields.length === 0) {
    return <EmptyState message="No projects added yet" onAdd={() => append({ name: "", url: "", startDate: "", endDate: "", bullets: [""] })} buttonText="Add Project" />;
  }

  return (
    <div className="space-y-4">
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border p-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="grid flex-1 grid-cols-2 gap-2">
              <Input {...register(`projects.items.${i}.name`)} placeholder="Project Name" />
              <Input {...register(`projects.items.${i}.url`)} placeholder="URL" />
              <DateField control={control} name={`projects.items.${i}.startDate`} label="Start" />
              <DateField control={control} name={`projects.items.${i}.endDate`} label="End" />
            </div>
            <Button type="button" variant="ghost" size="icon" className="ml-2 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <BulletFields control={control} register={register} basePath={`projects.items.${i}.bullets`} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", url: "", startDate: "", endDate: "", bullets: [""] })}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Project
      </Button>
    </div>
  );
}

function VolunteeringFields({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "volunteering.items" });

  if (fields.length === 0) {
    return <EmptyState message="No volunteering added yet" onAdd={() => append({ role: "", organization: "", startDate: "", endDate: "", bullets: [""] })} buttonText="Add Volunteering" />;
  }

  return (
    <div className="space-y-4">
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border p-3 space-y-3">
          <div className="flex items-start justify-between">
            <div className="grid flex-1 grid-cols-2 gap-2">
              <Input {...register(`volunteering.items.${i}.role`)} placeholder="Role" />
              <Input {...register(`volunteering.items.${i}.organization`)} placeholder="Organization" />
              <DateField control={control} name={`volunteering.items.${i}.startDate`} label="Start" />
              <DateField control={control} name={`volunteering.items.${i}.endDate`} label="End" />
            </div>
            <Button type="button" variant="ghost" size="icon" className="ml-2 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <BulletFields control={control} register={register} basePath={`volunteering.items.${i}.bullets`} />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ role: "", organization: "", startDate: "", endDate: "", bullets: [""] })}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Volunteering
      </Button>
    </div>
  );
}

function PublicationFields({ control, register }: { control: any; register: any }) {
  const { fields, append, remove } = useFieldArray({ control, name: "publications.items" });

  if (fields.length === 0) {
    return <EmptyState message="No publications added yet" onAdd={() => append({ title: "", publisher: "", date: "", url: "" })} buttonText="Add Publication" />;
  }

  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Input {...register(`publications.items.${i}.title`)} placeholder="Title" />
            <Input {...register(`publications.items.${i}.publisher`)} placeholder="Publisher" />
            <DateField control={control} name={`publications.items.${i}.date`} label="Date" />
            <Input {...register(`publications.items.${i}.url`)} placeholder="URL" />
          </div>
          <Button type="button" variant="ghost" size="icon" className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => append({ title: "", publisher: "", date: "", url: "" })}>
        <Plus className="mr-1 h-3.5 w-3.5" /> Add Publication
      </Button>
    </div>
  );
}

function BulletFields({ control, register, basePath }: { control: any; register: any; basePath: string }) {
  const { fields, append, remove } = useFieldArray({ control, name: basePath as any });

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Bullet Points</Label>
      {fields.map((f, i) => (
        <div key={f.id} className="flex gap-2">
          <Textarea {...register(`${basePath}.${i}`)} placeholder="Describe..." rows={3} className="flex-1 resize-y" />
          <Button type="button" variant="ghost" size="icon" className="mt-1 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => append("" as any)}>
        <Plus className="mr-1 h-3 w-3" /> Add Bullet
      </Button>
    </div>
  );
}
