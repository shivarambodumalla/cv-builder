"use client";

import { useCallback, useEffect, useRef } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parsedCvSchema, type ParsedCv } from "@/lib/validations/cv";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";

interface CvEditorFormProps {
  cvId: string;
  initialData: ParsedCv;
  onChange: (data: ParsedCv) => void;
  onSaveStatusChange?: (status: "idle" | "saving" | "saved") => void;
}

export function CvEditorForm({ cvId, initialData, onChange, onSaveStatusChange }: CvEditorFormProps) {
  const { register, control, getValues } = useForm<ParsedCv>({
    resolver: zodResolver(parsedCvSchema),
    defaultValues: initialData,
  });

  const {
    fields: expFields,
    append: appendExp,
    remove: removeExp,
  } = useFieldArray({ control, name: "experience" });

  const {
    fields: eduFields,
    append: appendEdu,
    remove: removeEdu,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({ control, name: "skills" as never });

  const watched = useWatch({ control });
  const debounceRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);
  const pendingRef = useRef(false);

  const save = useCallback(
    async (data: ParsedCv) => {
      const now = Date.now();
      if (now - lastSaveRef.current < 2000) {
        pendingRef.current = true;
        return;
      }
      pendingRef.current = false;
      lastSaveRef.current = now;
      onChange(data);
      onSaveStatusChange?.("saving");
      await fetch("/api/cv/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_id: cvId, parsed_json: data }),
      });
      onSaveStatusChange?.("saved");
    },
    [cvId, onChange, onSaveStatusChange]
  );

  // 2s debounce after last keystroke
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save(getValues());
    }, 2000);
    return () => clearTimeout(debounceRef.current);
  }, [watched, save, getValues]);

  // Save on blur — flush immediately if pending
  const handleBlur = useCallback(() => {
    clearTimeout(debounceRef.current);
    save(getValues());
  }, [save, getValues]);

  // Save on tab close
  useEffect(() => {
    function onBeforeUnload() {
      const data = getValues();
      const body = JSON.stringify({ cv_id: cvId, parsed_json: data });
      navigator.sendBeacon("/api/cv/save", new Blob([body], { type: "application/json" }));
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [cvId, getValues]);

  return (
    <div className="space-y-4" onBlur={handleBlur}>
      {/* Contact */}
      <Section title="Contact">
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
        </div>
      </Section>

      {/* Summary */}
      <Section title="Summary">
        <Textarea {...register("summary")} rows={4} placeholder="Professional summary..." />
      </Section>

      {/* Experience */}
      <Section title="Work Experience">
        <div className="space-y-4">
          {expFields.map((field, index) => (
            <ExperienceItem
              key={field.id}
              index={index}
              register={register}
              control={control}
              onRemove={() => removeExp(index)}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendExp({ company: "", role: "", startDate: "", endDate: "", bullets: [""] })
            }
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Experience
          </Button>
        </div>
      </Section>

      {/* Education */}
      <Section title="Education">
        <div className="space-y-3">
          {eduFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="grid flex-1 grid-cols-3 gap-2">
                <Input {...register(`education.${index}.institution`)} placeholder="University" />
                <Input {...register(`education.${index}.degree`)} placeholder="Degree" />
                <Input {...register(`education.${index}.year`)} placeholder="Year" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => removeEdu(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendEdu({ institution: "", degree: "", year: "" })}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Education
          </Button>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
          {skillFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-1 rounded-md border px-2 py-1">
              <Input
                {...register(`skills.${index}` as const)}
                className="h-6 w-24 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                placeholder="Skill"
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendSkill("" as never)}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add Skill
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen className="rounded-lg border">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors">
        {title}
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-4 pb-4 pt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function ExperienceItem({
  index,
  register,
  control,
  onRemove,
}: {
  index: number;
  register: ReturnType<typeof useForm<ParsedCv>>["register"];
  control: ReturnType<typeof useForm<ParsedCv>>["control"];
  onRemove: () => void;
}) {
  const {
    fields: bulletFields,
    append: appendBullet,
    remove: removeBullet,
  } = useFieldArray({ control, name: `experience.${index}.bullets` as never });

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="flex items-start justify-between">
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Input {...register(`experience.${index}.company`)} placeholder="Company" />
          <Input {...register(`experience.${index}.role`)} placeholder="Role" />
          <Input {...register(`experience.${index}.startDate`)} placeholder="Start Date" />
          <Input {...register(`experience.${index}.endDate`)} placeholder="End Date" />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-2 h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Bullet Points</Label>
        {bulletFields.map((field, bIndex) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`experience.${index}.bullets.${bIndex}` as const)}
              placeholder="Describe your achievement..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeBullet(bIndex)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => appendBullet("" as never)}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add Bullet
        </Button>
      </div>
    </div>
  );
}
