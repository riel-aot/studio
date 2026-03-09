'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useWebhook } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/file-uploader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import type { StudentListItem } from '@/lib/events';
import { normalizeAssessmentIdentifier } from '@/lib/utils';

export default function SetupPage() {
  const params = useParams<{ id: string }>();
  const assessmentId = params.id;
  const normalizedAssessmentId = normalizeAssessmentIdentifier(assessmentId) ?? assessmentId;
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedStudent, setSelectedStudentState] = React.useState<string | null>(null);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const { data: studentListData } = useWebhook<{}, any>({
    eventName: 'STUDENT_LIST',
    payload: {},
  });

  useEffect(() => {
    if (studentListData) {
      const raw = Array.isArray(studentListData) ? studentListData : studentListData.students || studentListData.items || [];
      const mapped = raw.map((s: any) => ({
        name: s.name,
        studentIdNumber: s.student_id ?? s.studentIdNumber,
        grade: s.grade,
        studentEmail: s.student_email ?? s.studentEmail,
        parentEmail: s.parent_email ?? s.parentEmail,
      }));
      setStudents(mapped);
      setLoadingStudents(false);
    }
  }, [studentListData]);

  useEffect(() => {
    const idFromUrl = searchParams.get('studentId');
    if (idFromUrl) setSelectedStudentState(idFromUrl);
  }, [searchParams]);

  const [activeTab, setActiveTab] = React.useState<'document' | 'image'>('document');
  const [status, setStatus] = useState<'idle' | 'uploaded' | 'analyzing' | 'done' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);

  const analyzeSelected = useCallback(async () => {
    if (!file) return;
    setStatus('analyzing');

    try {
      const formData = new FormData();
      
      if (activeTab === 'document') {
        formData.append('file', file);
        const response = await fetch('/api/extract-text', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Failed to extract text');
        const result = await response.json();
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('extractedText', result.text);
          if (selectedStudent) {
            sessionStorage.setItem('currentStudentId', selectedStudent);
            const matched = students.find(s => s.studentIdNumber === selectedStudent);
            if (matched) sessionStorage.setItem('currentStudentName', matched.name);
          }
        }
      } else {
        // Use local proxy to avoid CORS errors with external n8n binary nodes
        formData.append('data', file);
        const response = await fetch('/api/proxy-image', { method: 'POST', body: formData });
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to process image');
        }
        
        const result = await response.json();
        
        // Deep recursive search for extracted text in complex AI response structures
        const findExtractedText = (obj: any): string => {
          if (!obj) return '';
          if (typeof obj === 'string') return obj;
          if (Array.isArray(obj)) return obj.map(findExtractedText).join('\n');
          
          let text = '';
          const keysToTry = ['output', 'text', 'Message', 'extractedText', 'content'];
          for (const key of keysToTry) {
            if (obj[key]) {
              const val = typeof obj[key] === 'object' ? findExtractedText(obj[key]) : obj[key];
              if (val.length > text.length) text = val;
            }
          }
          
          if (!text && obj.parts) text = findExtractedText(obj.parts);
          return text;
        };

        const extracted = findExtractedText(result);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('extractedText', extracted);
          if (selectedStudent) {
            sessionStorage.setItem('currentStudentId', selectedStudent);
            const matched = students.find(s => s.studentIdNumber === selectedStudent);
            if (matched) sessionStorage.setItem('currentStudentName', matched.name);
          }
        }
      }

      setStatus('done');
      toast({ title: 'Success', description: 'Student work processed. Redirecting...' });
      setTimeout(() => router.push(`/teacher/assessments/${assessmentId}/document`), 600);
    } catch (e: any) {
      console.error(e);
      setStatus('error');
      toast({ variant: 'destructive', title: 'Analysis Failed', description: e.message });
    }
  }, [activeTab, file, selectedStudent, students, assessmentId, router, toast]);

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Setup & Input</CardTitle>
          <CardDescription>Select a student and upload their academic work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select value={selectedStudent || ''} onValueChange={setSelectedStudentState} disabled={loadingStudents}>
              <SelectTrigger id="student">
                <SelectValue placeholder={loadingStudents ? 'Loading students...' : 'Select a student to assess'} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.studentIdNumber} value={s.studentIdNumber}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Submission Method</Label>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as any); setStatus('idle'); setFile(null); }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="document">Typed Document</TabsTrigger>
                <TabsTrigger value="image">Handwritten Work</TabsTrigger>
              </TabsList>

              <div className="pt-4">
                {status === 'idle' ? (
                  <FileUploader 
                    onFileSelected={(f) => { setFile(f); setStatus('uploaded'); }} 
                    acceptedFileTypes={activeTab === 'document' ? { 'text/plain': ['.txt'] } : { 'image/*': ['.png', '.jpg', '.jpeg'] }} 
                  />
                ) : (
                  <div className="flex items-center justify-between p-4 border rounded-xl bg-secondary/20">
                    <div className="space-y-1">
                      <p className="text-sm font-bold">{file?.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                        {status === 'uploaded' ? 'Ready to analyze' : status === 'analyzing' ? 'Processing...' : status === 'done' ? 'Complete' : 'Error'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { setStatus('idle'); setFile(null); }} disabled={status === 'analyzing'}>
                      Replace File
                    </Button>
                  </div>
                )}
              </div>
            </Tabs>
          </div>

          <div className="pt-4">
            <Button className="w-full h-12 rounded-xl font-bold" disabled={status !== 'uploaded' || !selectedStudent} onClick={analyzeSelected}>
              {status === 'analyzing' ? 'Analyzing...' : activeTab === 'document' ? 'Process Document' : 'Run Image Extraction'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
