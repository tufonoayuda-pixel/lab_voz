"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components

export const PatientInfoForm: React.FC = () => {
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [evaluationDate, setEvaluationDate] = useState<Date | undefined>(new Date());
  const [medicalHistory, setMedicalHistory] = useState("");
  const [examinerName, setExaminerName] = useState("");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Antecedentes de Identificación</CardTitle>
        <CardDescription>Ingrese la información del paciente y del examinador para esta sesión.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patient-name">Nombre del Paciente</Label>
          <Input
            id="patient-name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Ej. Juan Pérez"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="patient-age">Edad</Label>
          <Input
            id="patient-age"
            type="number"
            value={patientAge}
            onChange={(e) => setPatientAge(e.target.value)}
            placeholder="Ej. 35"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="evaluation-date">Fecha de Evaluación</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !evaluationDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {evaluationDate ? format(evaluationDate, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={evaluationDate}
                onSelect={setEvaluationDate}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="examiner-name">Nombre del Examinador</Label>
          <Input
            id="examiner-name"
            value={examinerName}
            onChange={(e) => setExaminerName(e.target.value)}
            placeholder="Ej. Dr. Ana Gómez"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="medical-history">Antecedente Médico Importante</Label>
          <Textarea
            id="medical-history"
            value={medicalHistory}
            onChange={(e) => setMedicalHistory(e.target.value)}
            placeholder="Ej. Antecedentes de cirugía laríngea, tabaquismo, etc."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};